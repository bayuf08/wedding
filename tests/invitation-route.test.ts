import { describe, expect, it } from 'vitest'

import { resolveInvitationRoute } from '../app/utils/invitation-route'

describe('resolveInvitationRoute', () => {
  it('normalizes the public demo route to a ready invitation', () => {
    const result = resolveInvitationRoute('demo')

    expect(result.kind).toBe('ready')
    expect(result.accessState).toBe('LIVE_HYBRID')
  })

  it('keeps protected access separate from a ready invitation', () => {
    const result = resolveInvitationRoute('protected')

    expect(result.kind).toBe('protected')
    expect(result.accessState).toBe('LIVE_PROTECTED')
  })

  it.each([
    ['unavailable', 'UNAVAILABLE'],
    ['expired', 'EXPIRED'],
    ['revoked', 'REVOKED'],
    ['offline', 'DEPENDENCY_UNAVAILABLE'],
  ] as const)('returns the correct calm shell for %s', (shortcode, state) => {
    const result = resolveInvitationRoute(shortcode)

    expect(result.kind).toBe('unavailable')
    expect(result.accessState).toBe(state)
  })
})
