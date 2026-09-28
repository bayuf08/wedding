<script setup lang="ts">
import { computed } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../../types/claire'
import { packGallery } from '../../../utils/gallery-layout'
const props = defineProps<{ heading: string; images: ImageAsset[] }>()
const emit = defineEmits<{ open: [index: number] }>()
const columns = computed(() => packGallery(props.images))
function open(image: ImageAsset) { emit('open', props.images.findIndex(item => item.id === image.id)) }
</script>
<template>
  <section id="gallery" class="gallery-section" tabindex="-1" aria-labelledby="gallery-title"><div class="scene-container gallery-layout"><div class="gallery-title-track"><h2 id="gallery-title" class="gallery-title claire-serif motion-entry" data-entry="heading">{{ heading }}</h2></div><div class="gallery-photo-track">
    <div class="gallery-photo-list"><button v-for="(image, index) in images" :key="image.id" type="button" class="gallery-photo" :aria-label="`Open photo ${index + 1} of ${images.length}: ${image.alt}`" @click="$emit('open', index)"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 65vw, 573px" /></button></div>
    <div class="gallery-tablet-columns"><div v-for="(column, columnIndex) in columns" :key="columnIndex" class="gallery-tablet-column"><button v-for="image in column" :key="image.id" type="button" class="gallery-photo" :aria-label="`Open photo ${images.findIndex(item => item.id === image.id) + 1} of ${images.length}: ${image.alt}`" @click="open(image)"><ResponsivePhoto :asset="image" sizes="250px" /></button></div></div>
  </div></div></section>
</template>
