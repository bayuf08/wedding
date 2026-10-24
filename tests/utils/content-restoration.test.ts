import { describe, expect, it } from 'vitest'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'

describe('restored approved wedding content', () => {
  it('uses the recovered two-chapter story instead of the template Japan narrative', () => {
    const chapters = invitationFixture.content.story.chapters
    expect(chapters.map(chapter => [chapter.year, chapter.title])).toEqual([['2025', 'Our First Meeting'], ['2026', 'The Proposal']])
    const story = chapters.flatMap(chapter => chapter.paragraphs).join(' ')
    expect(story).toContain('The Neighbourhood Jakarta')
    expect(story).toContain('Kota Kasablanka Mall')
    expect(story).toContain('Pasuruan to Bekasi')
    expect(story).toContain('December 2026')
    expect(story).not.toMatch(/Tokyo|Japan|spring of 2023/)
  })
  it('uses supplied groom and adventure photos with the surviving local gallery title', () => {
    expect(mediaManifest.groom?.src).toBe('/images/the-groom.jpg')
    expect(mediaManifest.groom?.focal).toEqual({ desktop: '100% 50%', phone: '100% 50%' })
    expect(invitationFixture.content.gallery.heading).toBe('Our Little Adventures.')
    expect(invitationFixture.content.gallery.imageIds).toHaveLength(5)
    expect(invitationFixture.content.gallery.imageIds.every(id => mediaManifest[id]?.src.startsWith('/images/adventures/'))).toBe(true)
  })
})
