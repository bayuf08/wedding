import { appendHeader, createError, defineEventHandler, readBody, setHeader } from 'h3'
import { adminBackendRequest } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  setHeader(event, 'Cache-Control', 'no-store, private')
  const body = await readBody(event)
  if (!body || typeof body.email !== 'string' || body.email.length > 254 || typeof body.password !== 'string' || !body.password || body.password.length > 1024) throw createError({ statusCode: 422, statusMessage: 'Enter your email and password.' })
  const response = await adminBackendRequest(event, 'login', { email: body.email.trim(), password: body.password })
  if (!response.ok) throw createError({ statusCode: response.status === 401 ? 401 : response.status === 429 ? 429 : 503, statusMessage: response.status === 401 ? 'Email or password is incorrect.' : response.status === 429 ? 'Too many attempts. Please try again later.' : 'Secure sign-in is not configured yet.' })
  const result = await response.json()
  const cookies = response.headers.getSetCookie()
  if (result.authorized !== true || !cookies.some(cookie => /^wedding_admin_session=/.test(cookie) && /;\s*HttpOnly/i.test(cookie))) throw createError({ statusCode: 503, statusMessage: 'Secure sign-in is unavailable.' })
  for (const cookie of cookies.filter(value => /^wedding_admin_session=/.test(value))) appendHeader(event, 'Set-Cookie', cookie.replace(/;\s*Path=\/api\/admin(?=;|$)/i, '; Path=/manage-invitations'))
  return { authorized: true }
})
