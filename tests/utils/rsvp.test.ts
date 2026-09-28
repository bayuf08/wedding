import { describe, expect, it } from 'vitest'
import { codePointLength, createEmptyRsvpDraft, validateRsvpDraft } from '../../app/utils/rsvp'

describe('RSVP draft validation', () => {
  it('requires an explicit attendance choice', () => {
    expect(createEmptyRsvpDraft().attendance).toBeUndefined()
    expect(validateRsvpDraft({}).attendance).toBe('attendance_required')
  })
  it('requires event and one or two guests only when attending', () => {
    expect(validateRsvpDraft({ attendance: 'ATTENDING' })).toMatchObject({ eventId: 'event_required', attendanceCount: 'attending_count_required' })
    expect(validateRsvpDraft({ attendance: 'ATTENDING', eventId: 'matrimony', attendanceCount: 0 }).attendanceCount).toBe('attending_count_invalid')
    expect(validateRsvpDraft({ attendance: 'ATTENDING', eventId: 'reception', attendanceCount: 3 }).attendanceCount).toBe('attending_count_invalid')
    expect(validateRsvpDraft({ attendance: 'ATTENDING', eventId: 'matrimony', attendanceCount: 2 })).toEqual({})
    expect(validateRsvpDraft({ attendance: 'NOT_ATTENDING', eventId: 'matrimony', attendanceCount: 99 })).toEqual({})
  })
  it('counts Unicode code points and rejects overlong pasted messages', () => {
    expect(codePointLength('❤️')).toBe(2)
    expect(validateRsvpDraft({ attendance: 'NOT_ATTENDING', note: 'a'.repeat(501) }).note).toBe('message_too_long')
  })
})
