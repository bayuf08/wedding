import { describe, expect, it } from 'vitest'
import { galleryTitleTop, revealInset } from '../../app/utils/motion-math'
describe('measured motion formulas', () => {
  it('matches portrait clip samples and bounds', () => {
    expect(revealInset(417, 939)).toBeCloseTo(4.23793, 3)
    expect(revealInset(605, 939)).toBeCloseTo(10.12654, 3)
    expect(revealInset(2 * 939, 939)).toBe(50)
    expect(revealInset(0, 939)).toBe(0)
  })
  it('pins and releases the gallery title at its parent boundary', () => {
    expect(galleryTitleTop(100, 200, 2000, 939)).toBe(190)
    expect(galleryTitleTop(500, 200, 2000, 939)).toBe(90)
    expect(galleryTitleTop(1400, 200, 2000, 939)).toBe(-249)
  })
})
