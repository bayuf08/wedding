import type { RsvpDraft, RsvpErrors } from '../types/invitation'
export function createEmptyRsvpDraft(): RsvpDraft { return {} }
export function codePointLength(value: string): number { return Array.from(value).length }
export function validateRsvpDraft(draft: RsvpDraft): RsvpErrors {
  const errors: RsvpErrors = {}
  if (!draft.attendance) errors.attendance = 'attendance_required'
  if (draft.attendance === 'ATTENDING') {
    if (!draft.eventId) errors.eventId = 'event_required'
    else if (draft.eventId !== 'matrimony' && draft.eventId !== 'reception') errors.eventId = 'event_invalid'
    if (draft.attendanceCount === undefined) errors.attendanceCount = 'attending_count_required'
    else if (!Number.isInteger(draft.attendanceCount) || draft.attendanceCount < 1 || draft.attendanceCount > 2) errors.attendanceCount = 'attending_count_invalid'
  }
  if (codePointLength(draft.note || '') > 500) errors.note = 'message_too_long'
  return errors
}
