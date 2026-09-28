// Scroll offsets are relative to the named section's top at 1680 × 939 CSS pixels.
// The source images do not contain reliable absolute scroll or video timestamps.
export const referenceCheckpoints = [
  { source: '2.png', candidate: 'cover.png', scene: 'cover', section: null, relativeScroll: 0, media: 'still' },
  { source: '3.png', candidate: 'hero.png', scene: 'hero', section: 'welcome', relativeScroll: 0, media: 'variable-video-frame' },
  { source: '56.png', candidate: 'rsvp.png', scene: 'rsvp', section: 'rsvp', relativeScroll: 21, media: 'still' },
  { source: '67.png', candidate: 'gallery.png', scene: 'gallery', section: 'gallery', relativeScroll: 168, media: 'still' },
] as const
