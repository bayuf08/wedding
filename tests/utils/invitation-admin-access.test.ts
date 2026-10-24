import { afterEach, describe, expect, it, vi } from 'vitest'
import { IncomingMessage, ServerResponse } from 'node:http'
import { Socket } from 'node:net'
import { createEvent } from 'h3'
import { adminBackendRequest, getInvitationAdminAccess, requireSameOrigin } from '../../server/utils/invitation-admin-access'
function event(cookie = '') {
  const req = new IncomingMessage(new Socket())
  req.method = 'GET'; req.url = '/manage-invitations'; req.headers = { host: 'localhost:3000', cookie }
  return createEvent(req, new ServerResponse(req))
}
afterEach(() => vi.unstubAllGlobals())
describe('server-side invitation admin boundary', () => {
  it('fails closed with no backend configuration and never treats a cookie string as authorization', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ invitationAdminApiBase: '' }))
    const request = vi.fn()
    vi.stubGlobal('fetch', request)
    expect(await getInvitationAdminAccess(event(`wedding_admin_session=${'a'.repeat(64)}`))).toEqual({ status: 'unavailable' })
    expect(request).not.toHaveBeenCalled()
  })
  it('requires a verified backend session and does not forward unrelated cookies', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ invitationAdminApiBase: 'http://127.0.0.1:4400' }))
    const request = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify({ authorized: true }), { status: 200 })).mockResolvedValueOnce(new Response(JSON.stringify({ authorized: true, csrfToken: 'b'.repeat(64) }), { status: 200 }))
    vi.stubGlobal('fetch', request)
    const req = event(`other_cookie=private; wedding_admin_session=${'a'.repeat(64)}`)
    expect(await getInvitationAdminAccess(req)).toEqual({ status: 'unavailable' })
    expect(await getInvitationAdminAccess(req)).toEqual({ status: 'authorized' })
    expect(request.mock.calls[1]?.[1].headers.Cookie).toBe(`wedding_admin_session=${'a'.repeat(64)}`)
  })
  it('rejects foreign-origin mutations before contacting the backend', async () => {
    vi.stubGlobal('useRuntimeConfig', () => ({ invitationAdminApiBase: 'http://127.0.0.1:4400' }))
    const request = vi.fn(); vi.stubGlobal('fetch', request)
    expect(() => requireSameOrigin(event())).toThrow()
    await expect(adminBackendRequest(event(), 'logout')).rejects.toThrow()
    expect(request).not.toHaveBeenCalled()
  })
})
