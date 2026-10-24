import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'

describe('Claire media manifest', () => {
  it('resolves every scene and the supplied Adventure gallery photos to local files', () => {
    const content = invitationFixture.content
    expect(content.hero.posterId).toBe('hero-kv')
    expect(content.hero.videoSrc).toBeNull()
    expect(mediaManifest.closing?.src).toBe('/images/footer.jpg')
    expect(mediaManifest.closing?.width).toBe(2304)
    expect(mediaManifest.closing?.height).toBe(4096)
    expect(mediaManifest.gift?.src).toBe('/images/gift.jpeg')
    expect(mediaManifest.gift?.width).toBe(2134)
    expect(mediaManifest.gift?.height).toBe(3200)
    expect(mediaManifest.groom?.src).toBe('/images/the-groom.jpg')
    expect(mediaManifest.groom?.width).toBe(4096)
    expect(mediaManifest.groom?.height).toBe(2304)
    const ids = [content.cover.imageId, content.hero.posterId, ...content.quote.imageIds, ...content.profiles.map(item => item.imageId), ...content.story.imageIds, content.celebration.imageId, content.gift.imageId, content.rsvp.imageId, content.video.posterId, ...content.gallery.imageIds, content.closing.imageId, content.navigationImageId]
    expect(content.gallery.imageIds).toEqual(['adventure-1', 'adventure-2', 'adventure-3', 'adventure-4', 'adventure-5'])
    expect(content.gallery.imageIds).toHaveLength(5)
    expect(mediaManifest['adventure-1']?.src).toBe('/images/adventures/adventure-1.jpg')
    expect(mediaManifest['adventure-1']?.width).toBe(3072)
    expect(mediaManifest['adventure-1']?.height).toBe(4096)
    expect(mediaManifest['adventure-2']?.src).toBe('/images/adventures/adventure-2.png')
    expect(mediaManifest['adventure-2']?.width).toBe(1086)
    expect(mediaManifest['adventure-2']?.height).toBe(1448)
    expect(mediaManifest['adventure-3']?.src).toBe('/images/adventures/adventure-3.jpg')
    expect(mediaManifest['adventure-3']?.width).toBe(4096)
    expect(mediaManifest['adventure-3']?.height).toBe(2304)
    expect(mediaManifest['adventure-4']?.src).toBe('/images/adventures/adventure-4.jpg')
    expect(mediaManifest['adventure-4']?.width).toBe(4080)
    expect(mediaManifest['adventure-4']?.height).toBe(3072)
    expect(mediaManifest['adventure-5']?.src).toBe('/images/adventures/adventure-5.jpg')
    expect(mediaManifest['adventure-5']?.width).toBe(4096)
    expect(mediaManifest['adventure-5']?.height).toBe(2304)
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
