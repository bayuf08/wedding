import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
export function useMotionPreference() {
  const systemReduced = ref(false)
  const manualPaused = ref(false)
  const motionAllowed = computed(() => !systemReduced.value && !manualPaused.value)
  let media: MediaQueryList | undefined
  const change = () => { systemReduced.value = Boolean(media?.matches) }
  onMounted(() => { if (typeof window.matchMedia !== 'function') return; media = window.matchMedia('(prefers-reduced-motion: reduce)'); change(); media.addEventListener('change', change) })
  onBeforeUnmount(() => media?.removeEventListener('change', change))
  return { systemReduced, manualPaused, motionAllowed }
}
