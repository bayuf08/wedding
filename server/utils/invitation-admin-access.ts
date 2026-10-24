import { createError, getHeader, getRequestURL, type H3Event } from 'h3'
import type { InvitationAdminAccess } from '../../app/types/invitation-admin'
export function adminBackendBase(event: H3Event): string {
  const value = useRuntimeConfig(event).invitationAdminApiBase
  if (!value || typeof value !== 'string') throw createError({ statusCode: 503, statusMessage: 'Secure sign-in is not configured.' })
  const url = new URL(value)
  if ((url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1', 'localhost'].includes(url.hostname))) || url.username || url.password || url.search || url.hash || url.pathname !== '/') throw createError({ statusCode: 503, statusMessage: 'Secure sign-in is not configured.' })
  return url.origin
}
export function adminCookie(event: H3Event): string {
  return (getHeader(event, 'cookie') || '').split(';').map(part => part.trim()).find(part => /^wedding_admin_session=[a-f0-9]{64}$/.test(part)) || ''
}
export function requireSameOrigin(event: H3Event) {
  if (getHeader(event, 'origin') !== getRequestURL(event).origin) throw createError({ statusCode: 403, statusMessage: 'Request origin is not allowed.' })
}
export async function adminBackendRequest(event: H3Event, action: 'session' | 'login' | 'logout' | 'invitations' | 'invitations/import', body?: unknown, query = ''): Promise<Response> {
  const headers: Record<string, string> = { Cookie: adminCookie(event) }
  if (action !== 'session' && !(action === 'invitations' && body === undefined)) {
    requireSameOrigin(event)
    headers.Origin = getRequestURL(event).origin
    headers['Content-Type'] = 'application/json'
    const key = getHeader(event, 'idempotency-key')
    if (key) headers['Idempotency-Key'] = key
    const csrf = getHeader(event, 'x-csrf-token')
    if (csrf) headers['X-CSRF-Token'] = csrf
  }
  try {
    return await fetch(`${adminBackendBase(event)}/api/admin/${action}${query}`, { method: action === 'session' || (action === 'invitations' && body === undefined) ? 'GET' : 'POST', headers, body: body === undefined ? undefined : JSON.stringify(body), redirect: 'error', signal: AbortSignal.timeout(5000) })
  } catch { throw createError({ statusCode: 503, statusMessage: 'Secure sign-in is unavailable.' }) }
}
export async function getInvitationAdminAccess(event: H3Event): Promise<InvitationAdminAccess> {
  try {
    const response = await adminBackendRequest(event, 'session')
    if (response.status === 401) return { status: 'unauthenticated' }
    if (response.status === 403) return { status: 'forbidden' }
    if (!response.ok) return { status: 'unavailable' }
    const body = await response.json()
    return { status: body.authorized === true && /^[a-f0-9]{64}$/.test(body.csrfToken || '') ? 'authorized' : 'unavailable' }
  } catch { return { status: 'unavailable' } }
}
