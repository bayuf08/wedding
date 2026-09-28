<script setup lang="ts">
import { onBeforeUnmount, ref } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
defineProps<{ video: ClaireContent['video']; poster: ImageAsset }>()
const active = ref(false)
const feedback = ref('')
const pointerVisible = ref(false)
const pointerPosition = ref({ x: 0, y: 0 })
let pointerFrame = 0
let pointerNext = { x: 0, y: 0 }
function movePointer(event: PointerEvent) {
  const rect = (event.currentTarget as HTMLElement).getBoundingClientRect()
  pointerNext = { x: event.clientX - rect.left, y: event.clientY - rect.top }
  if (!pointerFrame) pointerFrame = requestAnimationFrame(() => { pointerPosition.value = pointerNext; pointerFrame = 0 })
}
onBeforeUnmount(() => { if (pointerFrame) cancelAnimationFrame(pointerFrame) })
function play(source: ClaireContent['video']['source']) { if (source) active.value = true; else feedback.value = 'Video playback is not available in this preview.' }
</script>
<template>
  <section class="video-feature" aria-label="Wedding film"><div class="video-frame reveal-frame" :data-active="active" @pointerenter="pointerVisible = true" @pointerleave="pointerVisible = false" @pointermove="movePointer">
    <video v-if="active && video.source?.kind === 'file'" :src="video.source.value" :poster="poster.src" controls autoplay playsinline />
    <iframe v-else-if="active && video.source?.kind === 'youtube'" :src="video.source.value" title="Wedding film" allow="autoplay; fullscreen" allowfullscreen />
    <template v-else><ResponsivePhoto :asset="poster" sizes="100vw" /><button type="button" class="video-play" @click="play(video.source)"><span aria-hidden="true">▶</span><span>PLAY</span></button><span class="video-pointer" :class="{ 'is-visible': pointerVisible }" :style="{ '--pointer-x': `${pointerPosition.x}px`, '--pointer-y': `${pointerPosition.y}px` }" aria-hidden="true">PLAY</span></template>
  </div><p v-if="feedback" class="video-feedback" role="status">{{ feedback }}</p></section>
</template>
