import { describe, expect, it } from 'vitest'
import invitation from '../../app/assets/data/invitation.json'
import media from '../../app/assets/data/media.json'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'

describe('public JSON invitation assets', () => {
  it('uses the JSON documents as the only content and media sources', () => {
    expect(invitationFixture).toBe(invitation)
    expect(mediaManifest).toBe(media)
    expect(invitationFixture.content.events.rows[0]?.id).toBe('matrimony')
    expect(invitationFixture.content.story.chapters.map(chapter => chapter.year)).toEqual(['2025', '2026'])
    expect(mediaManifest.groom?.src).toBe('/images/the-groom.jpg')
  })
  it('contains public display content rather than credentials or collected responses', () => {
    const forbidden = new Set(['password', 'accesstoken', 'secret', 'privatekey', 'rsvpresponses', 'giftconfirmations', 'guestresponses'])
    function allowed(value: unknown): boolean {
      if (!value || typeof value !== 'object') return true
      return Object.entries(value).every(([key, item]) => !forbidden.has(key.toLowerCase()) && allowed(item))
    }
    expect(allowed(invitation)).toBe(true)
    expect(allowed(media)).toBe(true)
  })
})
