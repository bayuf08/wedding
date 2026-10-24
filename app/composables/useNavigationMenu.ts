import { nextTick, onBeforeUnmount, onMounted, ref, watch, type Ref } from 'vue'

type Phase = 'closed' | 'opening' | 'open' | 'closing'
type Track = { element: HTMLElement; transform: string; opacity: string; animation: Animation }
const destinations = new Set(['welcome', 'profile', 'story', 'details', 'rsvp', 'gift', 'gallery'])
const order = [0, 2, 1, 4, 3, 6, 5, 8, 7, 9]
const easing = 'cubic-bezier(.19,1,.22,1)'

export function useNavigationMenu(
  dialog: Ref<HTMLDialogElement | null>, props: { open: boolean; motionEnabled: boolean },
  events: { close: () => void; navigate: (id: string) => void; presence: (value: boolean) => void },
) {
  const phase = ref<Phase>('closed'), intendedOpen = ref(false)
  let tracks: Track[] = [], generation = 0, returnFocus: HTMLElement | null = null
  let pendingDestination: string | undefined, preference: MediaQueryList | undefined
  let outsideStart = false

  function cancelAndFreeze() {
    const frozen = tracks.map(track => ({ ...track, current: getComputedStyle(track.element) }))
      .map(track => ({ ...track, matrix: track.current.transform, alpha: track.current.opacity }))
    for (const track of frozen) {
      track.animation.cancel()
      track.element.style.transform = track.matrix
      track.element.style.opacity = track.alpha
    }
    tracks = []
  }
  function finalPresentation(open: boolean) {
    const root = dialog.value
    if (!root) return
    for (const element of root.querySelectorAll<HTMLElement>('[data-menu-curtain]')) element.style.transform = open ? 'none' : 'translateY(0) scaleY(0)'
    for (const element of root.querySelectorAll<HTMLElement>('[data-menu-reveal], [data-menu-photo], [data-menu-caption]')) {
      element.style.transform = open ? 'none' : 'translateY(125%)'
      element.style.opacity = open ? '1' : '0'
    }
  }
  function settle(open: boolean, current: number) {
    if (current !== generation) return
    cancelAndFreeze(); finalPresentation(open)
    phase.value = open ? 'open' : 'closed'
    if (open) return
    const destination = pendingDestination; pendingDestination = undefined
    dialog.value?.close(); events.presence(false)
    if (!destination && returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
    if (destination) events.navigate(destination)
    else events.close()
  }
  function add(element: HTMLElement, transform: string, opacity: string, duration: number, delay = 0) {
    const current = getComputedStyle(element)
    let from = current.transform
    if (element.hasAttribute('data-menu-curtain')) {
      const matrix = /^matrix(3d)?\(([^)]+)\)$/.exec(from)
      const values = matrix?.[2]?.split(',').map(Number)
      // Preserve separate transform functions: a zero-scale matrix cannot be decomposed smoothly.
      if (values) from = `translateY(${values[matrix?.[1] ? 13 : 5]}px) scaleY(${values[matrix?.[1] ? 5 : 3]})`
      else if (from === 'none') from = 'translateY(0px) scaleY(1)'
    }
    const animation = element.animate([
      { transform: from, opacity: current.opacity }, { transform, opacity },
    ], { duration, delay, easing, fill: 'both' })
    tracks.push({ element, transform, opacity, animation })
  }
  async function transition(open: boolean) {
    const root = dialog.value
    if (!root || (open === intendedOpen.value && (phase.value === 'opening' || phase.value === 'closing'))) return
    const current = ++generation
    cancelAndFreeze(); intendedOpen.value = open
    if (open && !root.open) {
      returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
      for (const element of root.querySelectorAll<HTMLElement>('[data-menu-curtain]')) element.style.transform = 'translateY(100%) scaleY(0)'
      for (const element of root.querySelectorAll<HTMLElement>('[data-menu-reveal], [data-menu-photo], [data-menu-caption]')) {
        element.style.transform = 'translateY(125%)'; element.style.opacity = '0'
      }
      root.showModal(); events.presence(true)
      root.querySelector<HTMLElement>('[data-dialog-initial]')?.focus({ preventScroll: true })
    }
    if (!open && !root.open) { settle(false, current); return }
    phase.value = open ? 'opening' : 'closing'
    await nextTick()
    if (current !== generation) return
    if (!props.motionEnabled || preference?.matches || typeof root.animate !== 'function') { settle(open, current); return }
    for (const [index, element] of [...root.querySelectorAll<HTMLElement>('[data-menu-curtain]')].entries()) {
      const rank = order[index] || 0
      add(element, open ? 'translateY(0) scaleY(1)' : 'translateY(0) scaleY(0)', '1', open ? 600 : 420, open ? rank * 24 : (9 - rank) * 12)
    }
    const links = [...root.querySelectorAll<HTMLElement>('[data-menu-reveal]')]
    links.forEach((element, index) => add(element, open ? 'translateY(0)' : 'translateY(-125%)', '1', open ? 440 : 160, open ? 200 + index * 45 : (links.length - 1 - index) * 14))
    for (const element of root.querySelectorAll<HTMLElement>('[data-menu-photo]')) add(element, open ? 'translateY(0)' : 'translateY(-18px)', open ? '1' : '0', open ? 420 : 180, open ? 220 : 0)
    for (const element of root.querySelectorAll<HTMLElement>('[data-menu-caption]')) add(element, open ? 'translateY(0)' : 'translateY(-18px)', open ? '1' : '0', open ? 320 : 120, open ? 480 : 0)
    await Promise.all(tracks.map(track => track.animation.finished.catch(() => undefined)))
    settle(open, current)
  }
  function close() { pendingDestination = undefined; if (phase.value !== 'closed') void transition(false) }
  function toggle() { pendingDestination = undefined; void transition(!intendedOpen.value) }
  function navigate(id: string) {
    if (!destinations.has(id) || phase.value === 'closed') return
    pendingDestination = id; void transition(false)
  }
  function outside(event: Event) {
    return event.target instanceof Element && !event.target.closest('button, nav, .navigation-photo')
  }
  function pointerDown(event: PointerEvent) { outsideStart = outside(event) }
  function click(event: MouseEvent) { if (outsideStart && outside(event)) close(); outsideStart = false }
  function nativeClosed() { if (phase.value !== 'closed' && !dialog.value?.open) { pendingDestination = undefined; intendedOpen.value = false; settle(false, ++generation) } }
  function focusIn(event: FocusEvent) {
    if (phase.value === 'opening' && event.target instanceof Element && event.target.closest('nav')) settle(true, ++generation)
  }
  function keyDown(event: KeyboardEvent) {
    const root = dialog.value
    if (event.key !== 'Tab' || !root?.open) return
    const controls = [...root.querySelectorAll<HTMLElement>('button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])')]
    const first = controls[0], last = controls.at(-1)
    if (!first || !last) return
    if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
  }
  function preferenceChanged() { if (phase.value !== 'closed' && (!props.motionEnabled || preference?.matches)) settle(intendedOpen.value, ++generation) }
  watch(() => props.open, value => { if (value || phase.value !== 'closed') void transition(value) }, { flush: 'post', immediate: true })
  watch(() => props.motionEnabled, preferenceChanged)
  onMounted(() => {
    preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    preference.addEventListener('change', preferenceChanged)
    if (props.open && phase.value === 'closed') void transition(true)
  })
  onBeforeUnmount(() => {
    ++generation; cancelAndFreeze(); preference?.removeEventListener('change', preferenceChanged)
    phase.value = 'closed'; dialog.value?.close(); events.presence(false)
  })
  return { phase, intendedOpen, close, toggle, navigate, pointerDown, click, nativeClosed, focusIn, keyDown }
}
