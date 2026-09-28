<script setup lang="ts">
import ResponsivePhoto from '../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../types/claire'
defineProps<{ image: ImageAsset; progress: number }>()
</script>
<template>
  <div class="invitation-loader" role="status" aria-label="Loading invitation">
    <div class="loader-center">
      <span>THE WEDDING OF</span>
      <div class="loader-thumbnail"><ResponsivePhoto :asset="image" loading="eager" alt="" /></div>
      <span>BAYU - HILWA</span>
    </div>
    <span class="loader-progress">LOADING... {{ progress }}%</span>
  </div>
</template>
