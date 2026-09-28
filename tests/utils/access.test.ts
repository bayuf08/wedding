import { describe, expect, it } from 'vitest'

import { toRouteAccessState } from '../../app/utils/access'

describe('toRouteAccessState', () => {
  it.each([
    ['PUBLIC', 'LIVE_PUBLIC'],
    ['PROTECTED', 'LIVE_PROTECTED'],
    ['HYBRID', 'LIVE_HYBRID'],
  ] as const)('shows a live %s invitation as %s', (mode, expectedState) => {
    expect(toRouteAccessState({ status: 'AVAILABLE', mode })).toBe(expectedState)
  })

  it.each([
    ['UNAVAILABLE', 'UNAVAILABLE'],
    ['EXPIRED', 'EXPIRED'],
    ['REVOKED', 'REVOKED'],
    ['DEPENDENCY_UNAVAILABLE', 'DEPENDENCY_UNAVAILABLE'],
  ] as const)('preserves the user-facing %s state', (status, expectedState) => {
    expect(toRouteAccessState({ status })).toBe(expectedState)
  })

  it('does not present a service outage as an invitation that does not exist', () => {
    const outage = toRouteAccessState({ status: 'DEPENDENCY_UNAVAILABLE' })
    const missing = toRouteAccessState({ status: 'UNAVAILABLE' })

    expect(outage).toBe('DEPENDENCY_UNAVAILABLE')
    expect(outage).not.toBe(missing)
  })
})
