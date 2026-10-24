import { createError, defineEventHandler, getQuery } from 'h3'
import { adminBackendRequest } from '../../../utils/invitation-admin-access'
export default defineEventHandler(async event => {
  const query = getQuery(event), offset = Number(query.offset ?? 0), limit = Number(query.limit ?? 100)
  if (!Number.isInteger(offset) || offset < 0 || offset > 100000 || !Number.isInteger(limit) || limit < 1 || limit > 100) throw createError({ statusCode: 422, statusMessage: 'Invalid pagination.' })
  const response = await adminBackendRequest(event, 'invitations', undefined, `?offset=${offset}&limit=${limit}`)
  if (!response.ok) throw createError({ statusCode: [401,403,429].includes(response.status) ? response.status : 503, statusMessage: 'Private guest list is unavailable.' })
  const data = await response.json()
  if (!Array.isArray(data.rows) || typeof data.hasMore !== 'boolean') throw createError({ statusCode: 503, statusMessage: 'Private guest list is unavailable.' })
  return { rows: data.rows.map((row: Record<string, unknown>) => ({ id: row.id, externalId: row.externalId, name: row.name, maxAttendees: row.maxAttendees, linkToken: row.linkToken })), hasMore: data.hasMore }
})
