import { describe, expect, it } from 'vitest'
import { guestNameFromQuery } from '../../app/utils/guest-name'
describe('guestNameFromQuery', () => {
  it('handles absent, array, control, and HTML-looking values as text', () => {
    expect(guestNameFromQuery(undefined)).toBe('Guest Name')
    expect(guestNameFromQuery(['  Ada  ', 'Other'])).toBe('Ada')
    expect(guestNameFromQuery('<script>alert(1)</script>')).toBe('<script>alert(1)</script>')
    expect(guestNameFromQuery('\u0000A\nB')).toBe('AB')
  })
  it('caps Unicode code points', () => expect(Array.from(guestNameFromQuery('😀'.repeat(101)))).toHaveLength(100))
})
