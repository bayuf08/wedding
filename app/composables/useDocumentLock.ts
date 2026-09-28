import { onBeforeUnmount, watch, type Ref } from 'vue'
export function useDocumentLock(locked: Ref<boolean>) {
  let scrollY = 0
  let previous: { position: string; top: string; width: string; overflow: string } | null = null
  function apply(value: boolean) {
    if (typeof document === 'undefined') return
    if (value && !previous) {
      scrollY = window.scrollY
      previous = { position: document.body.style.position, top: document.body.style.top, width: document.body.style.width, overflow: document.body.style.overflow }
      document.body.style.position = 'fixed'; document.body.style.top = `-${scrollY}px`; document.body.style.width = '100%'; document.body.style.overflow = 'hidden'
    } else if (!value && previous) {
      Object.assign(document.body.style, previous); previous = null
      window.scrollTo({ top: scrollY, behavior: 'instant' })
    }
  }
  watch(locked, apply, { immediate: true })
  onBeforeUnmount(() => apply(false))
}
