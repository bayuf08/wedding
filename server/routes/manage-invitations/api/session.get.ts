import { createError, defineEventHandler, setHeader } from 'h3'
import { adminBackendRequest } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store, private')
  const response = await adminBackendRequest(event, 'session')
  if (!response.ok) throw createError({ statusCode: response.status === 401 ? 401 : response.status === 403 ? 403 : 503, statusMessage: 'Secure session is unavailable.' })
  const body = await response.json()
  if (body.authorized !== true || !/^[a-f0-9]{64}$/.test(body.csrfToken || '')) throw createError({ statusCode: 503, statusMessage: 'Secure session is unavailable.' })
  return { authorized: true, csrfToken: body.csrfToken, expiresIn: body.expiresIn }
})
