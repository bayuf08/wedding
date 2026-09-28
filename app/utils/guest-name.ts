export function guestNameFromQuery(value: unknown): string {
  const first = Array.isArray(value) ? value[0] : value
  if (typeof first !== 'string') return 'Guest Name'
  const normalized = first.replace(/[\u0000-\u001F\u007F]/g, '').trim()
  return Array.from(normalized || 'Guest Name').slice(0, 100).join('')
}
