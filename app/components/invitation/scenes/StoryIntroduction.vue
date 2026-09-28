<script setup lang="ts">
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
const props = defineProps<{ story: ClaireContent['story']; images: ImageAsset[]; paused: boolean }>()
const current = ref(0)
const previous = ref<number | null>(null)
const entering = ref(false)
const visible = ref(false)
const root = ref<HTMLElement | null>(null)
let observer: IntersectionObserver | undefined
let timer: ReturnType<typeof setInterval> | undefined
let fadeTimer: ReturnType<typeof setTimeout> | undefined
let pending = false
let disposed = false
async function advance() {
  if (pending || !visible.value || props.paused || props.images.length < 2) return
  pending = true
  const next = (current.value + 1) % props.images.length
  const asset = props.images[next]!
  const desiredWidth = window.innerWidth * window.devicePixelRatio
  const source = asset.sources.find(item => item.width >= desiredWidth) || asset.sources.at(-1)
  const preload = new Image()
  preload.src = source?.src || asset.src
  try {
    await preload.decode()
    if (disposed || !visible.value || props.paused) return
    previous.value = current.value
    current.value = next
    entering.value = true
    await nextTick()
    requestAnimationFrame(() => { if (!disposed) entering.value = false })
    if (fadeTimer) clearTimeout(fadeTimer)
    fadeTimer = setTimeout(() => { previous.value = null }, 150)
  } catch {
    // Keep the current photograph when the next local asset cannot decode.
  } finally {
    pending = false
  }
}
onMounted(() => {
  observer = new IntersectionObserver(entries => { visible.value = Boolean(entries[0]?.isIntersecting) }, { rootMargin: '200px' })
  if (root.value) observer.observe(root.value)
  timer = setInterval(advance, 4000)
})
onBeforeUnmount(() => { disposed = true; observer?.disconnect(); if (timer) clearInterval(timer); if (fadeTimer) clearTimeout(fadeTimer) })
</script>
<template>
  <section id="story" ref="root" class="story-introduction" tabindex="-1" aria-labelledby="story-intro-title">
    <div class="story-intro-frame reveal-frame">
      <div v-if="previous !== null && images[previous]" class="story-slide"><ResponsivePhoto :asset="images[previous]!" alt="" sizes="100vw" /></div>
      <div v-if="images[current]" :key="images[current]!.id" class="story-slide" :class="{ 'is-entering': entering }"><ResponsivePhoto :asset="images[current]!" alt="" sizes="100vw" /></div>
      <div class="story-intro-dim" />
      <h2 id="story-intro-title" class="story-intro-caption claire-caption">{{ story.caption }}</h2>
    </div>
  </section>
</template>
