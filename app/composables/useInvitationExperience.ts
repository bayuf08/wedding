import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { useDocumentLock } from './useDocumentLock'
export type OpeningState = 'loading' | 'covered' | 'opening' | 'open'
export type OverlayState = { kind: 'none' } | { kind: 'navigation' } | { kind: 'gift' } | { kind: 'lightbox'; index: number }
export function useInvitationExperience(galleryCount: number) {
  const opening = ref<OpeningState>('loading')
  const progress = ref(0)
  const overlay = ref<OverlayState>({ kind: 'none' })
  const locked = computed(() => opening.value !== 'open' || overlay.value.kind !== 'none')
  useDocumentLock(locked)
  let progressTimer: ReturnType<typeof setInterval> | undefined
  let holdTimer: ReturnType<typeof setTimeout> | undefined
  let openingTimer: ReturnType<typeof setTimeout> | undefined
  let reducedQuery: MediaQueryList | undefined
  function finishLoader() {
    if (progressTimer) clearInterval(progressTimer)
    if (holdTimer) clearTimeout(holdTimer)
    if (opening.value === 'loading') { progress.value = 100; opening.value = 'covered' }
  }
  onMounted(() => {
    reducedQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedQuery.addEventListener('change', onReducedChange)
    if (import.meta.dev && new URLSearchParams(window.location.search).get('qa') === 'static') { opening.value = 'open'; progress.value = 100; return }
    if (reducedQuery.matches) { finishLoader(); return }
    progressTimer = setInterval(() => {
      progress.value = Math.min(100, progress.value + 1)
      if (progress.value === 100) { if (progressTimer) clearInterval(progressTimer); holdTimer = setTimeout(() => { opening.value = 'covered' }, 500) }
    }, 40)
  })
  function onReducedChange(event: MediaQueryListEvent) { if (event.matches) finishLoader() }
  onBeforeUnmount(() => { if (progressTimer) clearInterval(progressTimer); if (holdTimer) clearTimeout(holdTimer); if (openingTimer) clearTimeout(openingTimer); reducedQuery?.removeEventListener('change', onReducedChange) })
  function openInvitation() {
    if (opening.value !== 'covered') return
    opening.value = 'opening'
    openingTimer = setTimeout(async () => { opening.value = 'open'; await nextTick(); window.scrollTo({ top: 0, behavior: 'instant' }); const hash = window.location.hash.slice(1); if (hash && document.getElementById(hash)) navigateTo(hash) }, reducedQuery?.matches ? 0 : 500)
  }
  function showNavigation() { if (opening.value === 'open') overlay.value = { kind: 'navigation' } }
  function showGift() { if (opening.value === 'open') overlay.value = { kind: 'gift' } }
  function showImage(index: number) { if (opening.value === 'open' && Number.isInteger(index) && index >= 0 && index < galleryCount) overlay.value = { kind: 'lightbox', index } }
  function closeOverlay() { overlay.value = { kind: 'none' } }
  async function navigateTo(id: string) {
    if (!['welcome', 'profile', 'story', 'details', 'rsvp', 'gift', 'gallery'].includes(id)) return
    closeOverlay(); await nextTick()
    requestAnimationFrame(() => { const target = document.getElementById(id); target?.scrollIntoView({ behavior: 'smooth', block: 'start' }); target?.focus({ preventScroll: true }) })
  }
  return { opening, progress, overlay, locked, openInvitation, showNavigation, showGift, showImage, closeOverlay, navigateTo }
}
