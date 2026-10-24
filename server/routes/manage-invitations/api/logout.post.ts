import { appendHeader, createError, defineEventHandler, setHeader, setResponseStatus } from 'h3'
import { adminBackendRequest } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store, private')
  const response = await adminBackendRequest(event, 'logout')
  if (!response.ok) throw createError({ statusCode: response.status === 403 ? 403 : 503, statusMessage: 'Unable to end this session.' })
  for (const cookie of response.headers.getSetCookie().filter(value => /^wedding_admin_session=/.test(value))) appendHeader(event, 'Set-Cookie', cookie.replace(/;\s*Path=\/api\/admin(?=;|$)/i, '; Path=/manage-invitations'))
  setResponseStatus(event, 204)
  return null
})
