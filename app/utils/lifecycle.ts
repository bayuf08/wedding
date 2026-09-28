import type { LifecycleState } from '../types/invitation'

export interface LifecyclePresentation {
  copyKey: `lifecycle.${Lowercase<LifecycleState>}`
  countdownEnabled: boolean
  rsvpEnabled: boolean
}

const presentationByLifecycle: Readonly<Record<LifecycleState, Readonly<LifecyclePresentation>>> = {
  UPCOMING_RSVP_OPEN: {
    copyKey: 'lifecycle.upcoming_rsvp_open',
    countdownEnabled: true,
    rsvpEnabled: true,
  },
  UPCOMING_RSVP_CLOSED: {
    copyKey: 'lifecycle.upcoming_rsvp_closed',
    countdownEnabled: true,
    rsvpEnabled: false,
  },
  WEDDING_DAY: {
    copyKey: 'lifecycle.wedding_day',
    countdownEnabled: false,
    rsvpEnabled: false,
  },
  POSTPONED: {
    copyKey: 'lifecycle.postponed',
    countdownEnabled: false,
    rsvpEnabled: false,
  },
  CANCELLED: {
    copyKey: 'lifecycle.cancelled',
    countdownEnabled: false,
    rsvpEnabled: false,
  },
  COMPLETED: {
    copyKey: 'lifecycle.completed',
    countdownEnabled: false,
    rsvpEnabled: false,
  },
  ARCHIVED: {
    copyKey: 'lifecycle.archived',
    countdownEnabled: false,
    rsvpEnabled: false,
  },
}

export function getLifecyclePresentation(state: LifecycleState): LifecyclePresentation {
  return { ...presentationByLifecycle[state] }
}
