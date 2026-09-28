<script setup lang="ts">
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
import { toSafeExternalUrl } from '../../../utils/safe-url'
defineProps<{ closing: ClaireContent['closing']; image: ImageAsset }>()
</script>
<template>
  <section class="closing-section" aria-labelledby="closing-title">
    <div class="closing-main">
      <h2 id="closing-title" class="closing-thank claire-serif motion-entry" data-entry="heading">Thank <span class="closing-inset"><ResponsivePhoto :asset="image" sizes="130px" alt="" /></span> <em>You</em></h2>
      <p class="closing-blessing claire-serif motion-entry" data-entry="blessing">{{ closing.blessing }}</p>
      <p class="closing-names">{{ closing.names }}</p>
    </div>
    <footer class="closing-footer">
      <!-- <a v-if="closing.credits[0] && toSafeExternalUrl(closing.credits[0].url, 'contact')" class="closing-created" :href="toSafeExternalUrl(closing.credits[0].url, 'contact') || undefined" target="_blank" rel="noopener noreferrer">{{ closing.credits[0].label }}</a>
      <div class="closing-credit-links">
        <template v-for="(credit, index) in closing.credits.slice(1)" :key="credit.label">
          <a v-if="toSafeExternalUrl(credit.url, 'contact')" :href="toSafeExternalUrl(credit.url, 'contact') || undefined" target="_blank" rel="noopener noreferrer"><span class="closing-credit-icon" aria-hidden="true">{{ ['◉', '◎', '●'][index] }}</span>{{ credit.label }}</a>
          <span v-else>{{ credit.label }}</span>
        </template>
      </div> -->
      <small>HILWA BAYU 26 DECEMBER 2026</small>
    </footer>
  </section>
</template>
