<script setup lang="ts">
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
defineProps<{ gift: ClaireContent['gift']; image: ImageAsset }>()
defineEmits<{ open: [] }>()
</script>
<template>
  <section id="gift" class="gift-introduction" tabindex="-1" aria-labelledby="gift-title">
    <div class="scene-container gift-layout"><div><h2 id="gift-title" class="gift-copy claire-body motion-entry" data-entry="heading">{{ gift.introduction }}</h2><button type="button" class="text-action motion-entry" @click="$emit('open')">Click Here</button></div><div class="gift-image"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 539px" /></div></div>
  </section>
</template>
