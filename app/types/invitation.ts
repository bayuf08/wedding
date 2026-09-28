import type { ClaireContent } from './claire'

export type AccessState = 'LIVE_PUBLIC' | 'LIVE_PROTECTED' | 'LIVE_HYBRID' | 'UNAVAILABLE' | 'EXPIRED' | 'REVOKED' | 'DEPENDENCY_UNAVAILABLE'
export type LifecycleState = 'UPCOMING_RSVP_OPEN' | 'UPCOMING_RSVP_CLOSED' | 'WEDDING_DAY' | 'POSTPONED' | 'CANCELLED' | 'COMPLETED' | 'ARCHIVED'
export type RsvpAttendance = 'ATTENDING' | 'NOT_ATTENDING'
export type RsvpSubmissionStatus = 'IDLE' | 'SUBMITTING' | 'SUCCESS' | 'ERROR'
export interface GuestContext { displayName?: string; accessTokenPresent: boolean; canSubmitRsvp: boolean }
export interface InvitationViewModel {
  slug: string
  couple: { firstName: string; secondName: string }
  accessState: AccessState
  lifecycle: LifecycleState
  content: ClaireContent
}
export interface RsvpDraft {
  attendance?: RsvpAttendance
  eventId?: 'matrimony' | 'reception'
  attendanceCount?: number
  note?: string
}
export interface RsvpErrors {
  attendance?: 'attendance_required'
  eventId?: 'event_required' | 'event_invalid'
  attendanceCount?: 'attending_count_required' | 'attending_count_invalid'
  note?: 'message_too_long'
}
export interface RsvpState { draft: RsvpDraft; errors: RsvpErrors; status: RsvpSubmissionStatus }
