export function createInvitationDelivery(request: <T>(url: string, options?: Record<string, unknown>) => Promise<T>, token: () => string | undefined, kind: 'rsvps' | 'gift-confirmations') {
  let pending: { json: string; key: string } | undefined
  return async (payload: Record<string, unknown>) => {
    const value = token()
    if (!value || !/^[a-f0-9]{64}$/.test(value)) return false
    const json = JSON.stringify(payload)
    if (pending && pending.json !== json) throw new Error('A previous request is unconfirmed. Restore its details and retry before submitting changed details.')
    pending ||= { json, key: crypto.randomUUID() }
    const result = await request<{ persisted: boolean }>(`/api/invitations/${value}/${kind}`, { method: 'POST', body: payload, headers: { 'Idempotency-Key': pending.key } })
    if (result.persisted !== true) throw new Error('Delivery is not confirmed. Retry the same details.')
    pending = undefined
    return true
  }
}
