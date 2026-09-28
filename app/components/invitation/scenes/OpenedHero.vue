<script setup lang="ts">
import HeroMedia from './HeroMedia.vue'
import HeroMarquee from './HeroMarquee.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
defineProps<{ hero: ClaireContent['hero']; poster: ImageAsset; foreground?: ImageAsset; darkening: number; mediaPaused: boolean }>()
</script>
<template>
  <section id="welcome" class="opened-hero" tabindex="-1" aria-labelledby="invitation-title">
    <HeroMedia :base="poster" :foreground="foreground" :video-src="hero.videoSrc" :paused="mediaPaused" v-slot="{ foregroundReady }">
      <div class="hero-media-dim" />
      <div class="hero-readability-scrim" aria-hidden="true" />
      <div class="hero-content">
        <div class="hero-meta claire-body motion-entry" data-entry="heading"><span>{{ hero.occasion }}</span><span>{{ hero.dateLabel }}</span></div>
        <h1 id="invitation-title" class="sr-only">The Wedding of {{ hero.names }}</h1>
        <HeroMarquee :text="hero.names" :ready="foregroundReady" />
        <div class="hero-scripture claire-body motion-entry" data-entry="heading"><p>{{ hero.scripture }}</p><p>{{ hero.attribution }}</p></div>
      </div>
    </HeroMedia>
    <div class="hero-blackout" :style="{ opacity: darkening }" aria-hidden="true" />
  </section>
</template>
