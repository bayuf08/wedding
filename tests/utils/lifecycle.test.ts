import { describe, expect, it } from 'vitest'

import { getLifecyclePresentation } from '../../app/utils/lifecycle'

describe('getLifecyclePresentation', () => {
  it.each([
    'UPCOMING_RSVP_OPEN',
    'UPCOMING_RSVP_CLOSED',
    'WEDDING_DAY',
    'POSTPONED',
    'CANCELLED',
    'COMPLETED',
    'ARCHIVED',
  ] as const)('gives %s a stable copy key for the invitation UI', (state) => {
    expect(getLifecyclePresentation(state).copyKey).toBe(`lifecycle.${state.toLowerCase()}`)
  })

  it('enables RSVP only while an upcoming invitation accepts responses', () => {
    expect(getLifecyclePresentation('UPCOMING_RSVP_OPEN').rsvpEnabled).toBe(true)

    for (const state of [
      'UPCOMING_RSVP_CLOSED',
      'WEDDING_DAY',
      'POSTPONED',
      'CANCELLED',
      'COMPLETED',
      'ARCHIVED',
    ] as const) {
      expect(getLifecyclePresentation(state).rsvpEnabled).toBe(false)
    }
  })

  it.each(['POSTPONED', 'CANCELLED'] as const)(
    'does not show a misleading countdown when the event is %s',
    (state) => {
      expect(getLifecyclePresentation(state).countdownEnabled).toBe(false)
    },
  )

  it('does not let a consumer mutation affect a later lifecycle lookup', () => {
    const firstPresentation = getLifecyclePresentation('UPCOMING_RSVP_OPEN')
    firstPresentation.countdownEnabled = false

    expect(getLifecyclePresentation('UPCOMING_RSVP_OPEN').countdownEnabled).toBe(true)
  })
})
