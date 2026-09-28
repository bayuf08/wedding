import { describe, expect, it } from 'vitest'
import { mediaManifest } from '../../app/data/media.manifest'
import { packGallery } from '../../app/utils/gallery-layout'

describe('tablet gallery packing', () => {
  it('assigns all sixteen reference photos once while preserving order within each column', () => {
    const images = Array.from({ length: 16 }, (_, index) => mediaManifest[`gallery-${String(index + 1).padStart(2, '0')}`]!)
    const [left, right] = packGallery(images)
    expect([...left, ...right].map(image => image.id).sort()).toEqual(images.map(image => image.id).sort())
    for (const column of [left, right]) {
      const positions = column.map(image => images.indexOf(image))
      expect(positions).toEqual([...positions].sort((a, b) => a - b))
    }
    const [leftHeight, rightHeight] = [left, right].map(column => column.reduce((sum, image) => sum + image.height / image.width + 0.03, 0))
    expect(Math.abs(leftHeight! - rightHeight!)).toBeLessThan(1.5)
  })
})
