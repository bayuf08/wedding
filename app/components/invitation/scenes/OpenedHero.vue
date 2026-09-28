<script setup lang="ts">
import { ref, watch } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import MarqueeStrip from '../shared/MarqueeStrip.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
const props = defineProps<{ hero: ClaireContent['hero']; poster: ImageAsset; darkening: number; mediaPaused: boolean }>()
const video = ref<HTMLVideoElement | null>(null)
const videoFailed = ref(false)
watch(() => props.mediaPaused, async paused => {
  if (!video.value || videoFailed.value) return
  if (paused) video.value.pause()
  else { try { await video.value.play() } catch { videoFailed.value = true } }
}, { flush: 'post' })
</script>
<template>
  <section id="welcome" class="opened-hero" tabindex="-1" aria-labelledby="invitation-title">
    <div class="hero-media"><ResponsivePhoto :asset="poster" loading="eager" priority alt="" /><video v-if="hero.videoSrc && !videoFailed" ref="video" class="hero-video" :src="hero.videoSrc" :poster="poster.src" muted loop playsinline :autoplay="!mediaPaused" @error="videoFailed = true" /></div>
    <div class="hero-media-dim" />
    <div class="hero-content">
      <div class="hero-meta claire-body motion-entry" data-entry="heading"><span>{{ hero.occasion }}</span><span>{{ hero.dateLabel }}</span></div>
      <h1 id="invitation-title" class="sr-only">The Wedding of {{ hero.names }}</h1>
      <MarqueeStrip :text="hero.names" />
      <div class="hero-scripture claire-body motion-entry" data-entry="heading"><p>{{ hero.scripture }}</p><p>{{ hero.attribution }}</p></div>
    </div>
    <div class="hero-blackout" :style="{ opacity: darkening }" aria-hidden="true" />
  </section>
</template>
