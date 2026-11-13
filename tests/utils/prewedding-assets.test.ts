import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { mediaManifest } from '../../app/data/media.manifest'
describe('supplied wedding photographs', () => {
  it('does not reference Claire template photographs in any manifest entry', () => {
    for (const asset of Object.values(mediaManifest)) {
      expect(asset.src).not.toContain('/images/claire/')
      for (const source of asset.sources) {
        expect(source.src).not.toContain('/images/claire/')
        expect(existsSync(path.resolve('public', source.src.slice(1)))).toBe(true)
      }
      expect(existsSync(path.resolve('public', asset.src.slice(1)))).toBe(true)
    }
  })
  it('preserves supplied hero and personal photo sources', () => {
    expect(mediaManifest['hero-kv']!.src).toBe('/images/kv.png')
    expect(mediaManifest.bride!.src).toBe('/images/the-bride.jpg')
    expect(mediaManifest.groom!.src).toBe('/images/the-groom.jpg')
    expect(mediaManifest.closing!.src).toBe('/images/footer.jpg')
  })
})
