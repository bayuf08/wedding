import { onBeforeUnmount, onMounted, watch, type Ref } from 'vue'
import { clamp01, revealInset } from '../utils/motion-math'
export function useScrollScenes(root: Ref<HTMLElement | null>, allowed: Ref<boolean>, onUpdate?: (scroll: number) => void) {
  let raf = 0
  let resize: ResizeObserver | undefined
  function update() {
    raf = 0
    if (!root.value) return
    onUpdate?.(window.scrollY)
    const frames = [...root.value.querySelectorAll<HTMLElement>('.reveal-frame')]
    const panels = [...root.value.querySelectorAll<HTMLElement>('.quote-panel')]
    const entries = [...root.value.querySelectorAll<HTMLElement>('.motion-entry')]
    const portraits = [...root.value.querySelectorAll<HTMLElement>('.profile-portrait')]
    const celebration = root.value.querySelector<HTMLElement>('.celebration-portrait')
    const gift = root.value.querySelector<HTMLElement>('.gift-image')
    const height = window.innerHeight
    const frameReads = frames.map(element => [element, element.getBoundingClientRect().top] as const)
    const panelReads = panels.map(element => [element, element.getBoundingClientRect()] as const)
    const entryReads = entries.map(element => [element, element.getBoundingClientRect().top] as const)
    const portraitReads = portraits.map(element => [element, element.getBoundingClientRect()] as const)
    const celebrationRect = celebration?.getBoundingClientRect()
    const giftRect = gift?.getBoundingClientRect()
    const giftSectionTop = gift?.closest('.gift-introduction')?.getBoundingClientRect().top
    for (const [element, top] of frameReads) element.style.clipPath = allowed.value && element.dataset.active !== 'true' ? `inset(${revealInset(top, height)}%)` : 'none'
    for (const [element, rect] of panelReads) {
      const u = clamp01((height - rect.top) / (height + rect.height))
      const index = panels.indexOf(element)
      const [start, end] = index === 0 ? [.45, .66] : index === 1 ? [.25, .36] : [.25, .4]
      element.style.opacity = allowed.value ? String(clamp01((u - start) / (end - start))) : '1'
    }
    if (allowed.value) for (const [element, top] of entryReads) element.classList.toggle('is-visible', top <= height - 120 || element.contains(document.activeElement))
    for (const [element, rect] of portraitReads) {
      const photo = element.querySelector<HTMLElement>('.responsive-photo')
      if (!photo) continue
      const progress = clamp01((1.3 * height - rect.top) / (1.8 * height))
      photo.style.transform = allowed.value ? `translateY(${-0.4 * rect.height * progress}px)` : ''
    }
    if (celebration && celebrationRect) {
      const progress = clamp01((height - celebrationRect.top) / (height + celebrationRect.height))
      celebration.style.transform = allowed.value ? `translateY(${10 - 20 * progress}px)` : ''
      const photo = celebration.querySelector<HTMLElement>('.responsive-photo')
      if (photo) photo.style.transform = allowed.value ? `translateY(${-0.4 * celebrationRect.height * progress}px)` : ''
    }
    if (gift && giftRect && giftSectionTop !== undefined) {
      const progress = clamp01((height - giftSectionTop) / (height + giftRect.height))
      gift.style.transform = allowed.value && window.innerWidth >= 768 ? `translateY(${-200 + 400 * progress}px)` : ''
      const photo = gift.querySelector<HTMLElement>('.responsive-photo')
      if (photo) photo.style.transform = allowed.value ? `translateY(${-0.4 * giftRect.height * progress}px)` : ''
    }
  }
  function schedule() { if (!raf) raf = requestAnimationFrame(update) }
  onMounted(() => {
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    resize = new ResizeObserver(schedule)
    if (root.value) resize.observe(root.value)
    schedule()
  })
  watch(allowed, schedule)
  onBeforeUnmount(() => { window.removeEventListener('scroll', schedule); window.removeEventListener('resize', schedule); resize?.disconnect(); if (raf) cancelAnimationFrame(raf) })
  return { refresh: schedule }
}
