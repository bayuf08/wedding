<script setup lang="ts">
import ResponsivePhoto from '../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../types/claire'
defineProps<{ cover: ClaireContent['cover']; image: ImageAsset; guestName: string; opening: boolean }>()
defineEmits<{ open: [] }>()
</script>
<template>
  <div class="opening-cover" :class="{ 'is-opening': opening }">
    <ResponsivePhoto class="cover-image" :asset="image" loading="eager" priority alt="" />
    <div class="cover-scrim" />
    <div class="cover-upper">
      <p>{{ cover.eyebrow }}</p>
      <p class="cover-names claire-italic">{{ cover.names }}</p>
      <p class="cover-date">{{ cover.dateLabel }}</p>
    </div>
    <div class="cover-lower">
      <p class="cover-dear claire-italic">Dear,</p>
      <p class="cover-guest claire-serif">{{ guestName }}</p>
      <p class="cover-apology">{{ cover.apology }}</p>
      <button type="button" class="cover-open" :disabled="opening" @click="$emit('open')">Let's Open</button>
    </div>
  </div>
</template>
