<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import type { ImageAsset } from '../../types/claire'

const props = withDefaults(defineProps<{
  asset: ImageAsset
  loading?: 'eager' | 'lazy'
  priority?: boolean
  sizes?: string
  alt?: string
}>(), { loading: 'lazy', priority: false, sizes: '100vw' })
const failed = ref(false)
watch(() => [props.asset.id, props.asset.src], () => { failed.value = false })
const webp = computed(() => props.asset.sources.filter(source => source.format === 'webp').map(source => `${source.src} ${source.width}w`).join(', '))
const altText = computed(() => props.alt === undefined ? props.asset.alt : props.alt)
const position = computed(() => ({ '--photo-desktop-position': props.asset.focal.desktop, '--photo-phone-position': props.asset.focal.phone }))
</script>

<template>
  <span v-if="failed" class="responsive-photo responsive-photo--fallback" :style="{ aspectRatio: `${asset.width} / ${asset.height}` }" :role="altText ? 'img' : undefined" :aria-label="altText || undefined">
    <span v-if="altText">Image unavailable</span>
  </span>
  <picture v-else class="responsive-picture" :style="position">
    <source v-if="asset.mobileSrc" media="(max-width: 767px)" :srcset="asset.mobileSrc">
    <source v-if="webp" type="image/webp" :srcset="webp" :sizes="sizes">
    <img class="responsive-photo" :src="asset.src" :alt="altText" :width="asset.width" :height="asset.height" :loading="loading" decoding="async" :fetchpriority="priority ? 'high' : 'auto'" @error="failed = true">
  </picture>
</template>
