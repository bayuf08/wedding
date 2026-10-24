import { describe, it, expect, vi } from 'vitest'
import { createInvitationAdminGateway } from '../../app/utils/invitation-admin-gateway'
import { createInvitationDelivery } from '../../app/utils/invitation-delivery'
const token = 'a'.repeat(64)
describe('private invitation adapters', () => {
  it('loads all pages and separates internal reference from public token', async () => {
    const request = vi.fn().mockResolvedValueOnce({ rows: [{ id: '1', externalId: 'ref-one', name: 'Synthetic One', maxAttendees: 1, linkToken: token }], hasMore: true }).mockResolvedValueOnce({ rows: [], hasMore: false })
    const rows = await createInvitationAdminGateway(request, () => 'csrf').list()
    expect(rows[0]).toMatchObject({ shortcode: 'ref-one', linkToken: token, guestLimit: 1 })
    expect(request.mock.calls[1]?.[0]).toContain('offset=100')
  })
  it('uses CSRF and stable atomic idempotency and confirms records by external ID', async () => {
    const request = vi.fn().mockResolvedValueOnce({ created: 1, replayed: false }).mockResolvedValueOnce({ rows: [{ id: '1', externalId: 'ref-one', name: 'Synthetic One', maxAttendees: 1, linkToken: token }], hasMore: false })
    const rows = await createInvitationAdminGateway(request, () => 'csrf').create([{ clientRowId: 'row', shortcode: 'ref-one', name: 'Synthetic One', guestLimit: 1 }], 'operation')
    expect(request.mock.calls[0]?.[1]).toMatchObject({ credentials: 'include', headers: { 'X-CSRF-Token': 'csrf', 'Idempotency-Key': 'operation' }, body: { rows: [{ externalId: 'ref-one', name: 'Synthetic One', maxAttendees: 1 }] } })
    expect(rows[0]).toMatchObject({ status: 'created', clientRowId: 'row', guest: { linkToken: token } })
  })
  it('returns atomic conflicts without pretending any row was created', async () => {
    const request = vi.fn().mockRejectedValue({ statusCode: 409 })
    const rows = await createInvitationAdminGateway(request, () => 'csrf').create([{ clientRowId: 'row', shortcode: 'ref-one', name: 'Synthetic One', guestLimit: 1 }], 'operation')
    expect(rows[0]?.status).toBe('rejected')
    expect(request).toHaveBeenCalledTimes(1)
  })
  it('does not send demo reviews and reuses the same key after an uncertain delivery', async () => {
    const request = vi.fn().mockRejectedValueOnce(new Error('offline')).mockResolvedValue({ persisted: true })
    expect(await createInvitationDelivery(request, () => undefined, 'rsvps')({})).toBe(false)
    expect(request).not.toHaveBeenCalled()
    const deliver = createInvitationDelivery(request, () => token, 'rsvps')
    await expect(deliver({ attendance: 'NOT_ATTENDING' })).rejects.toThrow('offline')
    await expect(deliver({ attendance: 'ATTENDING' })).rejects.toThrow('previous request')
    expect(await deliver({ attendance: 'NOT_ATTENDING' })).toBe(true)
    expect(request.mock.calls[0]?.[1].headers).toEqual(request.mock.calls[1]?.[1].headers)
    await deliver({ attendance: 'NOT_ATTENDING' })
    expect(request.mock.calls[2]?.[1].headers).not.toEqual(request.mock.calls[1]?.[1].headers)
  })
})
