import type { CalendarRecord } from '../types/claire'
export type CalendarResult = { kind: 'available'; content: string } | { kind: 'unavailable' }
function esc(value: string) { return value.replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;') }
function utc(value: Date) { return value.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '') }
function fold(line: string): string {
  const encoder = new TextEncoder()
  let result = ''
  let bytes = 0
  for (const character of line) {
    const size = encoder.encode(character).length
    if (bytes + size > 75) { result += '\r\n '; bytes = 1 }
    result += character
    bytes += size
  }
  return result
}
export function makeCalendar(event: CalendarRecord | null): CalendarResult {
  if (!event || !/(?:Z|[+-]\d{2}:\d{2})$/.test(event.startsAt) || !/(?:Z|[+-]\d{2}:\d{2})$/.test(event.endsAt)) return { kind: 'unavailable' }
  const start = new Date(event.startsAt), end = new Date(event.endsAt)
  if (!Number.isFinite(start.valueOf()) || !Number.isFinite(end.valueOf()) || end <= start) return { kind: 'unavailable' }
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Claire Preview//EN', 'BEGIN:VEVENT', `UID:${esc(event.uid)}`, `DTSTAMP:${utc(new Date())}`, `DTSTART:${utc(start)}`, `DTEND:${utc(end)}`, `SUMMARY:${esc(event.title)}`, `LOCATION:${esc(event.location)}`, 'END:VEVENT', 'END:VCALENDAR']
  return { kind: 'available', content: lines.map(fold).join('\r\n') + '\r\n' }
}
