import { describe, expect, it } from 'vitest'
import { calendarHandoffUrl, googleCalendarUrl, makeCalendar } from '../../app/utils/calendar'
import invitation from '../../app/assets/data/invitation.json'

const event = {
  uid: 'bayu-hilwa-preview',
  title: 'Bayu, Hilwa; wedding',
  startsAt: '2026-08-20T08:00:00+07:00',
  endsAt: '2026-08-20T10:00:00+07:00',
  location: 'Jl. Taman Palem, Jakarta',
}

describe('calendar serialization', () => {
  it('refuses missing, ambiguous, invalid, and reversed dates', () => {
    expect(makeCalendar(null)).toEqual({ kind: 'unavailable' })
    expect(makeCalendar({ ...event, startsAt: '2026-08-20T08:00:00' })).toEqual({ kind: 'unavailable' })
    expect(makeCalendar({ ...event, endsAt: 'not-a-date' })).toEqual({ kind: 'unavailable' })
    expect(makeCalendar({ ...event, endsAt: event.startsAt })).toEqual({ kind: 'unavailable' })
  })

  it('writes a UTC event with escaped text and CRLF line endings', () => {
    const result = makeCalendar({ ...event, title: 'Bayu, Hilwa; wedding\\day\ncelebration', location: 'Jakarta\r\nIndonesia' })
    expect(result.kind).toBe('available')
    if (result.kind !== 'available') return
    const unfolded = result.content.replace(/\r\n /g, '')
    expect(unfolded).toContain('DTSTART:20260820T010000Z\r\n')
    expect(unfolded).toContain('DTEND:20260820T030000Z\r\n')
    expect(unfolded).toContain('SUMMARY:Bayu\\, Hilwa\\; wedding\\\\day\\ncelebration')
    expect(unfolded).toContain('LOCATION:Jakarta\\nIndonesia')
    expect(result.content.replace(/\r\n/g, '')).not.toContain('\n')
    expect(result.content.endsWith('\r\n')).toBe(true)
  })

  it('folds long Unicode lines to at most 75 UTF-8 bytes', () => {
    const title = 'Wedding 🎉 '.repeat(20)
    const result = makeCalendar({ ...event, title })
    expect(result.kind).toBe('available')
    if (result.kind !== 'available') return
    for (const line of result.content.trimEnd().split('\r\n')) {
      expect(new TextEncoder().encode(line).length).toBeLessThanOrEqual(75)
    }
    expect(result.content.replace(/\r\n /g, '')).toContain(`SUMMARY:${title}`)
  })
})

describe('Google Calendar template', () => {
  it('preserves the canonical wedding date and WIB offset', () => {
    const url = new URL(googleCalendarUrl(invitation.content.celebration.calendar)!)
    expect(url.searchParams.get('dates')).toBe('20261226T010000Z/20261226T030000Z')
    expect(url.searchParams.get('ctz')).toBe('Asia/Jakarta')
    const location = invitation.content.celebration.calendar.location
    expect(location.match(/Kec\. Tambun Utara/g)).toHaveLength(1)
    expect(location).not.toContain('Kec. Kec.')
    expect(url.searchParams.get('location')).toBe(location)
    const venueRows = invitation.content.events.rows.filter(row => row.lines.some(line => line.includes('Tambun Utara')))
    expect(venueRows).toHaveLength(2)
    for (const row of venueRows) expect(row.lines).toContain(location)
  })
  it('targets Chrome on Android with an exactly encoded web fallback, without native insert extras', () => {
    const special = { ...event, title: 'Hilwa & Bayu #1; 🎉', description: 'A? B=2\nC + D' }
    const web = googleCalendarUrl(special)!
    const intent = calendarHandoffUrl(special, 'Mozilla/5.0 (Linux; Android 15) Chrome/130')!
    expect(intent).toBe(`intent://${web.slice(8)}#Intent;scheme=https;action=android.intent.action.VIEW;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(web)};end`)
    expect(decodeURIComponent(intent.split('S.browser_fallback_url=')[1]!.split(';end')[0]!)).toBe(web)
    expect(intent).not.toContain('INSERT')
    expect(intent).not.toContain('beginTime')
    expect(calendarHandoffUrl(null, 'Android')).toBeNull()
    for (const ua of ['', 'Mozilla/5.0 (iPhone; CPU iPhone OS 18)', 'Windows NT 10.0']) expect(calendarHandoffUrl(special, ua)).toBe(web)
  })
  it('encodes canonical title, venue and description and displays the UTC event in Jakarta', () => {
    const details = 'Akad & reception?\nPlease review and save.'
    const url = new URL(googleCalendarUrl({ ...event, description: details })!)
    expect(url.origin + url.pathname).toBe('https://calendar.google.com/calendar/render')
    expect(Object.fromEntries(url.searchParams)).toEqual({ action: 'TEMPLATE', text: event.title, dates: '20260820T010000Z/20260820T030000Z', ctz: 'Asia/Jakarta', location: event.location, details })
    expect(googleCalendarUrl(null)).toBeNull()
    expect(googleCalendarUrl({ ...event, startsAt: 'invalid' })).toBeNull()
    expect(new URL(googleCalendarUrl(event)!).searchParams.get('details')).toBe(event.title)
  })
})
