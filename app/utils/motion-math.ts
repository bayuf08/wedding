export function clamp01(value: number): number { return Math.min(1, Math.max(0, value)) }
export function revealInset(top: number, viewportHeight: number): number { return 50 * (1 - clamp01((2 * viewportHeight - top) / (1.7 * viewportHeight))) }
export function galleryTitleTop(scroll: number, galleryTop: number, galleryBottom: number, viewportHeight: number): number {
  if (scroll < galleryTop) return galleryTop - scroll + 90
  return 90 + Math.min(0, galleryBottom - scroll - viewportHeight)
}
