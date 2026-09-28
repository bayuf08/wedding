import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'

describe('Claire media manifest', () => {
  it('resolves every scene and all sixteen gallery slots to local files', () => {
    const content = invitationFixture.content
    expect(content.hero.posterId).toBe('hero-kv')
    expect(content.hero.videoSrc).toBeNull()
    const ids = [content.cover.imageId, content.hero.posterId, ...content.quote.imageIds, ...content.profiles.map(item => item.imageId), ...content.story.imageIds, content.celebration.imageId, content.gift.imageId, content.rsvp.imageId, content.video.posterId, ...content.gallery.imageIds, content.closing.imageId, content.navigationImageId]
    expect(content.gallery.imageIds).toHaveLength(16)
    for (const id of ids) {
      const asset = mediaManifest[id]
      expect(asset, id).toBeDefined()
      expect(asset!.width).toBeGreaterThan(0)
      expect(asset!.height).toBeGreaterThan(0)
      expect(existsSync(join(process.cwd(), 'public', asset!.src))).toBe(true)
      expect(asset!.sources.map(source => source.width)).toEqual([...asset!.sources.map(source => source.width)].sort((a, b) => a - b))
      for (const source of asset!.sources) expect(existsSync(join(process.cwd(), 'public', source.src))).toBe(true)
    }
  })
})
