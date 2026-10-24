import { defineEventHandler, getRequestURL, setHeader, setResponseStatus } from 'h3'
import { getInvitationAdminAccess } from '../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  const path = getRequestURL(event).pathname.replace(/\/$/, '')
  if (path !== '/manage-invitations' && !path.startsWith('/manage-invitations/')) return
  setHeader(event, 'Cache-Control', 'no-store, private')
  setHeader(event, 'X-Robots-Tag', 'noindex, nofollow, noarchive')
  setHeader(event, 'Vary', 'Cookie')
  if (path.startsWith('/manage-invitations/api/')) return
  const access = await getInvitationAdminAccess(event)
  event.context.invitationAdminAccess = access
  if (access.status !== 'authorized') setResponseStatus(event, access.status === 'unavailable' ? 503 : access.status === 'forbidden' ? 403 : 401)
})
