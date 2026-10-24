import type { InvitationAdminGateway, InvitationGuest } from '../types/invitation-admin'
type Request = <T>(url: string, options?: Record<string, unknown>) => Promise<T>
interface StoredGuest { id: string; externalId: string; name: string; maxAttendees: number; linkToken: string }
export function createInvitationAdminGateway(request: Request, csrf: () => string): InvitationAdminGateway {
  async function list(): Promise<InvitationGuest[]> {
    const guests: InvitationGuest[] = []
    for (let offset = 0; offset <= 100000; offset += 100) {
      const result = await request<{ rows: StoredGuest[]; hasMore: boolean }>(`/manage-invitations/api/invitations?offset=${offset}&limit=100`, { credentials: 'include' })
      if (!Array.isArray(result.rows) || result.rows.some(row => typeof row.id !== 'string' || typeof row.externalId !== 'string' || typeof row.name !== 'string' || ![1,2].includes(row.maxAttendees) || !/^[a-f0-9]{64}$/.test(row.linkToken))) throw new Error('Invalid private guest response.')
      guests.push(...result.rows.map(row => ({ id: row.id, name: row.name, shortcode: row.externalId, guestLimit: row.maxAttendees, linkToken: row.linkToken, enabled: true })))
      if (!result.hasMore) return guests
      if (!result.rows.length) throw new Error('Invalid pagination.')
    }
    throw new Error('Guest list exceeds supported pagination.')
  }
  return { list, async create(rows, operationId) {
    try {
      await request('/manage-invitations/api/invitations', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrf(), 'Idempotency-Key': operationId }, body: { rows: rows.map(row => ({ externalId: row.shortcode, name: row.name, maxAttendees: row.guestLimit })) } })
    } catch (error) {
      if ((error as { statusCode?: number }).statusCode === 409) return rows.map(row => ({ clientRowId: row.clientRowId, status: 'rejected' as const, message: 'The atomic batch conflicts with existing invitations. No rows in this attempt were added.' }))
      throw error
    }
    const confirmed = await list()
    // A confirmed atomic import is resolved by its private external ID, never by a name guess.
    return rows.map(row => { const guest = confirmed.find(guest => guest.shortcode === row.shortcode && guest.name === row.name && guest.guestLimit === row.guestLimit); return guest ? { clientRowId: row.clientRowId, status: 'created' as const, guest } : { clientRowId: row.clientRowId, status: 'unknown' as const, retryable: true } })
  } }
}
