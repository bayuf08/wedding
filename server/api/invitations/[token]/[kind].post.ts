import { createError, defineEventHandler, getHeader, getRouterParam, readBody, setResponseStatus } from 'h3'
import { invitationGuest } from '../../../utils/invitation-guest'
import { adminBackendBase, requireSameOrigin } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  requireSameOrigin(event)
  const kind = getRouterParam(event, 'kind')
  if (kind !== 'rsvps' && kind !== 'gift-confirmations') throw createError({ statusCode: 404 })
  const key = getHeader(event, 'idempotency-key') || ''
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(key)) throw createError({ statusCode: 400, statusMessage: 'Request key required.' })
  if (Number(getHeader(event, 'content-length')) > 8192) throw createError({ statusCode: 413 })
  const guest = await invitationGuest(event), body = await readBody(event)
  const token = getRouterParam(event, 'token')! // invitationGuest validated this route parameter.
  if (!body || typeof body !== 'object' || Array.isArray(body) || JSON.stringify(body).length > 8192) throw createError({ statusCode: 422 })
  if (kind === 'rsvps' && body.attendance === 'ATTENDING' && (!Number.isInteger(body.attendanceCount) || body.attendanceCount < 1 || body.attendanceCount > guest.maxAttendees)) throw createError({ statusCode: 422, statusMessage: 'Attendance exceeds your invitation limit.' })
  let response: Response
  try { response = await fetch(`${adminBackendBase(event)}/api/${kind}`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Idempotency-Key': key, 'X-Invitation-Token': token }, body: JSON.stringify({ ...body, name: guest.name }), redirect: 'error', signal: AbortSignal.timeout(5000) }) }
  catch { throw createError({ statusCode: 503, statusMessage: 'Unable to confirm delivery. Retry the same request.' }) }
  if (!response.ok) throw createError({ statusCode: [409,422,429].includes(response.status) ? response.status : 503, statusMessage: 'Unable to confirm delivery.' })
  const result = await response.json()
  if (result.persisted !== true) throw createError({ statusCode: 503, statusMessage: 'Durable delivery is not confirmed.' })
  setResponseStatus(event, response.status)
  return { persisted: true, replayed: result.replayed === true }
})
