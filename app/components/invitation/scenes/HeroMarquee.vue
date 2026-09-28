<script setup lang="ts">
defineProps<{ text: string; ready: boolean }>()
</script>

<template>
  <div class="hero-marquee" :class="ready ? 'hero-marquee--ready' : 'hero-marquee--waiting'" aria-hidden="true">
    <div class="hero-marquee-track">
      <div v-for="copy in 2" :key="copy" class="hero-marquee-half">
        <span v-for="repeat in 2" :key="repeat" class="hero-marquee-group">
          <span>{{ text }}</span><span class="hero-marquee-flower">*</span>
        </span>
      </div>
    </div>
  </div>
</template>
