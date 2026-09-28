import { describe, expect, it } from 'vitest'
import { makeCalendar } from '../../app/utils/calendar'

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
