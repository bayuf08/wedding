<script setup lang="ts">
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
defineProps<{ quote: ClaireContent['quote']; images: [ImageAsset, ImageAsset, ImageAsset] }>()
</script>
<template>
  <section class="quote-passage" aria-labelledby="quote-heading">
    <div class="quote-stage">
      <h2 id="quote-heading" class="quote-heading claire-serif motion-entry" data-entry="quote">{{ quote.text }}</h2>
      <div v-for="(image, index) in images" :key="image.id" class="quote-panel" :class="`quote-panel--${index + 1}`"><ResponsivePhoto :asset="image" alt="" /></div>
    </div>
    <div class="quote-gradient" aria-hidden="true" />
  </section>
</template>
