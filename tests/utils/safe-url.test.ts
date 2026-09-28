import { describe, expect, it } from 'vitest'

import { toSafeExternalUrl } from '../../app/utils/safe-url'

describe('toSafeExternalUrl', () => {
  it('returns an absolute http(s) link for a guest-facing map', () => {
    expect(toSafeExternalUrl(' https://maps.example.test/venue ', 'map')).toBe(
      'https://maps.example.test/venue',
    )
    expect(toSafeExternalUrl('http://contact.example.test', 'contact')).toBe(
      'http://contact.example.test/',
    )
  })

  it.each(['javascript:alert(1)', 'data:text/html,hello', '/venue', 'venue.example.test'])(
    'rejects an unsafe or relative guest link: %s',
    (value) => {
      expect(toSafeExternalUrl(value, 'map')).toBeNull()
    },
  )

  it('allows mailto and tel only for the explicitly matching contact purpose', () => {
    expect(toSafeExternalUrl('mailto:rsvp@example.test', 'email')).toBe('mailto:rsvp@example.test')
    expect(toSafeExternalUrl('tel:+628123456789', 'phone')).toBe('tel:+628123456789')
    expect(toSafeExternalUrl('mailto:rsvp@example.test', 'contact')).toBeNull()
    expect(toSafeExternalUrl('tel:+628123456789', 'map')).toBeNull()
  })
})
