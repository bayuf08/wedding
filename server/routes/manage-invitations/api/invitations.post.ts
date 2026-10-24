import { createError, defineEventHandler, readBody, setResponseStatus, getHeader } from 'h3'
import { adminBackendRequest } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  if (Number(getHeader(event, 'content-length')) > 131072) throw createError({ statusCode: 413, statusMessage: 'Import is too large.' })
  const body = await readBody(event)
  if (JSON.stringify(body).length > 131072 || !Array.isArray(body?.rows) || body.rows.length < 1 || body.rows.length > 200) throw createError({ statusCode: 422, statusMessage: 'Invalid import.' })
  const response = await adminBackendRequest(event, 'invitations/import', body)
  if (!response.ok) throw createError({ statusCode: [401,403,409,422,429].includes(response.status) ? response.status : 503, statusMessage: response.status === 409 ? 'This request conflicts with existing invitations. Nothing in this batch was added.' : 'Unable to confirm invitation storage.' })
  const data = await response.json()
  if (!Number.isInteger(data.created) || typeof data.replayed !== 'boolean') throw createError({ statusCode: 503, statusMessage: 'Unable to confirm invitation storage.' })
  setResponseStatus(event, response.status)
  return { created: data.created, replayed: data.replayed }
})
