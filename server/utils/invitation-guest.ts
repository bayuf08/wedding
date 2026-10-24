import { createError, getRouterParam, setHeader, type H3Event } from 'h3'
import { adminBackendBase } from './invitation-admin-access'
export async function invitationGuest(event: H3Event) {
  setHeader(event, 'Cache-Control', 'no-store, private')
  setHeader(event, 'Referrer-Policy', 'no-referrer')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow')
  const token = getRouterParam(event, 'token') || ''
  if (!/^[a-f0-9]{64}$/.test(token)) throw createError({ statusCode: 404, statusMessage: 'Invitation unavailable.' })
  let response: Response
  try { response = await fetch(`${adminBackendBase(event)}/api/invitations/${token}`, { redirect: 'error', signal: AbortSignal.timeout(5000) }) }
  catch { throw createError({ statusCode: 503, statusMessage: 'Invitation unavailable.' }) }
  if (!response.ok) throw createError({ statusCode: response.status === 404 ? 404 : 503, statusMessage: 'Invitation unavailable.' })
  const data = await response.json()
  if (typeof data.name !== 'string' || !data.name.trim() || Array.from(data.name).length > 100 || ![1,2].includes(data.maxAttendees)) throw createError({ statusCode: 503, statusMessage: 'Invitation unavailable.' })
  return { name: data.name, maxAttendees: data.maxAttendees as number }
}
