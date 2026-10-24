import { createServer, type Server } from 'node:http'
import { expect, test } from '@playwright/test'
const token = 'a'.repeat(64), csrf = 'b'.repeat(64), session = 'c'.repeat(64)
let server: Server, guests: Record<string, unknown>[] = [], deliveries: Record<string, unknown>[] = [], imports = new Map<string, string>()
test.beforeAll(async () => {
  server = createServer(async (req, res) => {
    res.setHeader('Content-Type', 'application/json')
    const url = new URL(req.url || '/', 'http://127.0.0.1:4389')
    const reply = (status: number, value: unknown) => { res.statusCode = status; res.end(JSON.stringify(value)) }
    let text = ''; for await (const part of req) text += part
    const body = text ? JSON.parse(text) : {}
    if (url.pathname === `/api/invitations/${token}`) return reply(200, { name: 'Synthetic Invited Guest', maxAttendees: 1, ignoredPrivateField: 'must-not-pass-through' })
    if (url.pathname.startsWith('/api/invitations/')) return reply(404, { error: 'not_found' })
    if (url.pathname === '/api/rsvps' || url.pathname === '/api/gift-confirmations') { if (req.headers['x-invitation-token'] !== token) return reply(403, { error: 'invalid_invitation' }); deliveries.push(body); return reply(201, { persisted: true, replayed: false }) }
    if (url.pathname === '/api/admin/login') {
      if (body.email !== 'admin@example.test' || body.password !== 'synthetic-password-only') return reply(401, {})
      res.setHeader('Set-Cookie', `wedding_admin_session=${session}; HttpOnly; SameSite=Strict; Path=/api/admin`)
      return reply(200, { authorized: true, csrfToken: csrf })
    }
    if (!req.headers.cookie?.includes(`wedding_admin_session=${session}`)) return reply(401, {})
    if (url.pathname === '/api/admin/session') return reply(200, { authorized: true, csrfToken: csrf, expiresIn: 7200 })
    if (req.method === 'POST' && req.headers['x-csrf-token'] !== csrf) return reply(403, {})
    if (url.pathname === '/api/admin/invitations' && req.method === 'GET') return reply(200, { rows: guests, hasMore: false })
    if (url.pathname === '/api/admin/invitations/import') {
      const key = String(req.headers['idempotency-key']); const previous = imports.get(key)
      if (previous && previous !== JSON.stringify(body)) return reply(409, {})
      if (!previous) { imports.set(key, JSON.stringify(body)); guests.push(...body.rows.map((row: Record<string, unknown>) => ({ ...row, id: String(guests.length + 1), linkToken: token }))) }
      return reply(previous ? 200 : 201, { created: body.rows.length, replayed: !!previous })
    }
    if (url.pathname === '/api/admin/logout') { res.setHeader('Set-Cookie', 'wedding_admin_session=; Max-Age=0; HttpOnly; SameSite=Strict; Path=/api/admin'); res.statusCode = 204; return res.end() }
    return reply(404, {})
  })
  await new Promise<void>(resolve => server.listen(4389, '127.0.0.1', resolve))
})
test.afterAll(async () => { await new Promise<void>(resolve => server.close(() => resolve())) })

test('same-origin admin login, manual entry and reviewed Excel import use private storage contracts', async ({ page, request }) => {
  expect((await request.get('/manage-invitations/api/invitations')).status()).toBe(401)
  await page.goto('/manage-invitations')
  await page.locator('#admin-email').fill('admin@example.test')
  await page.locator('#admin-password').fill('synthetic-password-only')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.locator('#admin-name')).toBeVisible()
  await page.locator('#admin-name').fill('Synthetic Manual Guest')
  await page.locator('#admin-code').fill('synthetic-manual')
  await page.getByRole('button', { name: 'Add invitation', exact: true }).click()
  await expect(page.getByText('Invitation confirmed by the server.')).toBeVisible()
  const link = page.getByRole('link', { name: 'Open invitation' }).first()
  await expect(link).toHaveAttribute('href', `/invite/${token}`)
  const ExcelJS = (await import('exceljs')).default
  const book = new ExcelJS.Workbook(), sheet = book.addWorksheet('Invitations')
  sheet.addRow(['name', 'externalId', 'maxAttendees']); sheet.addRow(['Synthetic Import Guest', 'synthetic-import', 1]); sheet.addRow(['', 'invalid', 1])
  await page.getByRole('button', { name: 'Import Excel', exact: true }).click()
  await page.locator('#admin-workbook').setInputFiles({ name: 'synthetic.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: Buffer.from(new Uint8Array(await book.xlsx.writeBuffer() as ArrayBuffer)) })
  await expect(page.getByText('1 eligible · 1 need correction.', { exact: false })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Save reviewed invitations' })).toBeDisabled()
  await page.getByRole('checkbox').check()
  await page.getByRole('button', { name: 'Save reviewed invitations' }).click()
  await expect(page.getByText('created', { exact: true })).toBeVisible()
  expect(guests).toHaveLength(2)
  for (const width of [320, 390, 1680]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true) }
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page.locator('#admin-password')).toBeVisible()
})

test('token lookup limits public data and submission forwards the route token instead of a forged client header', async ({ request, page }) => {
  const response = await request.get(`/api/invitations/${token}`)
  expect(await response.json()).toEqual({ name: 'Synthetic Invited Guest', maxAttendees: 1 })
  expect(response.headers()['cache-control']).toContain('no-store')
  expect((await request.get(`/api/invitations/${'d'.repeat(64)}`)).status()).toBe(404)
  const headers = { Origin: 'http://127.0.0.1:4174', 'Idempotency-Key': '0ea56098-56cf-4ae7-955e-377df181f23b', 'X-Invitation-Token': 'forged-client-header' }
  expect((await request.post(`/api/invitations/${token}/rsvps`, { headers, data: { name: 'Forged', attendance: 'ATTENDING', eventId: 'matrimony', attendanceCount: 2 } })).status()).toBe(422)
  expect(deliveries).toHaveLength(0)
  expect((await request.post(`/api/invitations/${token}/rsvps`, { headers, data: { name: 'Forged', attendance: 'NOT_ATTENDING', note: 'Synthetic' } })).status()).toBe(201)
  expect(deliveries[0]).toEqual({ name: 'Synthetic Invited Guest', attendance: 'NOT_ATTENDING', note: 'Synthetic' })
  expect((await request.post(`/api/invitations/${token}/gift-confirmations`, { headers, data: { bankId: 'preview-a', amount: '12.50', note: 'Synthetic' } })).status()).toBe(201)
  expect(deliveries[1]?.name).toBe('Synthetic Invited Guest')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto(`/invite/${token}?to=Forged`)
  await expect(page.getByText('Synthetic Invited Guest', { exact: true }).first()).toBeVisible()
  await page.getByRole('button', { name: "Let's Open", exact: true }).click()
  await expect(page.locator('#rsvp-name')).toHaveValue('Synthetic Invited Guest')
  await expect(page.locator('#rsvp-attendanceCount')).toHaveAttribute('max', '1')
  await expect(page.locator('#rsvp-attendanceCount')).toHaveValue('')
  await page.locator('#rsvp-attendanceCount').fill('1')
  await page.getByRole('button', { name: 'Send RSVP', exact: true }).click()
  await expect(page.getByText('Your RSVP has been saved. Thank you.')).toBeVisible()
  expect(deliveries[2]).toMatchObject({ name: 'Synthetic Invited Guest', attendanceCount: 1 })
  for (const width of [320, 390, 1680]) { await page.setViewportSize({ width, height: 900 }); expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true) }
  await page.goto(`/invite/${'d'.repeat(64)}`)
  await expect(page.locator('#rsvp-name')).toHaveCount(0)
  expect(await page.content()).not.toContain('Synthetic Invited Guest')
})
