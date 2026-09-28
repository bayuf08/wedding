<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../../types/claire'

const props = defineProps<{
  base: ImageAsset
  foreground?: ImageAsset
  videoSrc: string | null
  paused: boolean
}>()

const video = ref<HTMLVideoElement | null>(null)
const videoFailed = ref(false)
const portraitMedia = '(max-width: 767px), (max-width: 1023px) and (orientation: portrait)'
const baseLoaded = ref(false)
const foregroundLoaded = ref(false)
const foregroundFailed = ref(false)
const foregroundReady = computed(() => !props.foreground || Boolean(props.videoSrc && !videoFailed.value) || (baseLoaded.value && foregroundLoaded.value && !foregroundFailed.value))
const resetMedia = () => { baseLoaded.value = false; foregroundLoaded.value = false; foregroundFailed.value = false }
let mediaQuery: MediaQueryList | null = null
watch(() => [props.base.src, props.base.mobileSrc, props.foreground?.src, props.foreground?.mobileSrc], resetMedia)
onMounted(() => {
  if (!window.matchMedia) return
  mediaQuery = window.matchMedia(portraitMedia)
  mediaQuery.addEventListener('change', resetMedia)
})
onUnmounted(() => mediaQuery?.removeEventListener('change', resetMedia))
watch(() => props.paused, async paused => {
  if (!video.value || videoFailed.value) return
  if (paused) video.value.pause()
  else { try { await video.value.play() } catch { videoFailed.value = true } }
}, { flush: 'post' })
</script>

<template>
  <div class="hero-media hero-media--base" aria-hidden="true">
    <ResponsivePhoto :asset="base" :mobile-media="portraitMedia" loading="eager" priority alt="" @loaded="baseLoaded = true" @failed="baseLoaded = true" />
    <video v-if="videoSrc && !videoFailed" ref="video" class="hero-video" :src="videoSrc" :poster="base.src" muted loop playsinline :autoplay="!paused" @error="videoFailed = true" />
  </div>
  <slot :foreground-ready="foregroundReady" />
  <div v-if="foreground && !foregroundFailed && (!videoSrc || videoFailed)" class="hero-media hero-media--foreground" :class="foregroundReady ? 'hero-media--ready' : 'hero-media--waiting'" aria-hidden="true">
    <ResponsivePhoto :asset="foreground" :mobile-media="portraitMedia" loading="eager" alt="" @loaded="foregroundLoaded = true" @failed="foregroundFailed = true" />
  </div>
</template>
