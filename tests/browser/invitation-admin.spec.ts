import { expect, test } from '@playwright/test'

test('private invitation route fails closed without configured authentication', async ({ page }) => {
  for (const width of [320, 390, 1680]) {
    await page.setViewportSize({ width, height: 900 })
    const response = await page.goto('/manage-invitations?admin=true&role=admin')
    expect(response?.status()).toBe(503)
    expect(response?.headers()['cache-control']).toContain('no-store')
    expect(response?.headers()['x-robots-tag']).toContain('noindex')
    await expect(page.getByRole('heading', { name: 'Your guest list.' })).toBeVisible()
    await expect(page.getByText('Secure access is not available yet.')).toBeVisible()
    await expect(page.locator('#admin-name')).toHaveCount(0)
    await expect(page.locator('#admin-workbook')).toHaveCount(0)
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeDisabled()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('main').screenshot({ path: `/tmp/wedding-private-admin-locked-${width}.png` })
  }
})

test('admin session and login cannot bypass server configuration', async ({ request }) => {
  const session = await request.get('/manage-invitations/api/session')
  expect(session.status()).toBe(503)
  const wrongOrigin = await request.post('/manage-invitations/api/login', { headers: { Origin: 'https://outside.example.test' }, data: { email: 'admin@example.test', password: 'synthetic-not-a-real-password' } })
  expect(wrongOrigin.status()).toBe(403)
  const validOrigin = await request.post('/manage-invitations/api/login', { headers: { Origin: 'http://127.0.0.1:4173' }, data: { email: 'admin@example.test', password: 'synthetic-not-a-real-password' } })
  expect(validOrigin.status()).toBe(503)
})

test('mocked cookie-session UI supports login/logout without storing tokens', async ({ page }) => {
  let authorized = false
  const csrf = 'c'.repeat(64)
  await page.route('**/manage-invitations/api/session', route => route.fulfill({ status: authorized ? 200 : 401, contentType: 'application/json', body: JSON.stringify(authorized ? { authorized: true, csrfToken: csrf, expiresIn: 7200 } : { error: 'authentication_required' }) }))
  await page.route('**/manage-invitations/api/login', route => { authorized = true; return route.fulfill({ status: 200, contentType: 'application/json', body: '{"authorized":true}' }) })
  await page.route('**/manage-invitations/api/logout', route => { expect(route.request().headers()['x-csrf-token']).toBe(csrf); authorized = false; return route.fulfill({ status: 204 }) })
  await page.route('**/manage-invitations/api/invitations?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"rows":[],"hasMore":false}' }))
  await page.goto('/manage-invitations')
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeEnabled()
  await page.locator('#admin-email').fill('admin@example.test')
  await page.locator('#admin-password').fill('synthetic-not-a-real-password')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Sign out', exact: true })).toBeVisible()
  await expect(page.locator('#admin-name')).toBeVisible()
  expect(await page.evaluate(() => localStorage.length)).toBe(0)
  await page.getByRole('button', { name: 'Sign out', exact: true }).click()
  await expect(page.locator('#admin-password')).toBeVisible()
  await expect(page.locator('#admin-password')).toHaveValue('')
})

test('authorized synthetic preview parses xlsx in a worker and requires explicit confirmation before saving', async ({ page }) => {
  const ExcelJS = (await import('exceljs')).default
  const book = new ExcelJS.Workbook(), sheet = book.addWorksheet('Invitations')
  sheet.addRow(['name', 'externalId', 'maxAttendees'])
  sheet.addRow(['Synthetic Guest', 'synthetic-guest', 2])
  sheet.addRow(['', 'needs-correction', 1])
  const buffer = Buffer.from(new Uint8Array(await book.xlsx.writeBuffer() as ArrayBuffer))
  await page.route('**/manage-invitations/api/session', route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ authorized: true, csrfToken: 'd'.repeat(64), expiresIn: 7200 }) }))
  await page.route('**/manage-invitations/api/invitations?*', route => route.fulfill({ status: 200, contentType: 'application/json', body: '{"rows":[],"hasMore":false}' }))
  await page.goto('/manage-invitations')
  await page.getByRole('button', { name: 'Import Excel', exact: true }).click()
  await page.locator('#admin-workbook').setInputFiles({ name: 'synthetic-guests.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer })
  await expect(page.getByText('1 eligible · 1 need correction.', { exact: false })).toBeVisible()
  await page.getByRole('checkbox').check()
  await expect(page.getByRole('button', { name: 'Save reviewed invitations', exact: true })).toBeEnabled()
  for (const width of [390, 1680]) {
    await page.setViewportSize({ width, height: 939 })
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.locator('main').screenshot({ path: `/tmp/wedding-admin-synthetic-import-${width}.png` })
  }
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Download empty template', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('wedding-invitations-template.xlsx')
})
