<script setup lang="ts">
import ProfileCard from '../shared/ProfileCard.vue'
import type { ImageAsset, ProfileRecord } from '../../../types/claire'
defineProps<{ profiles: [ProfileRecord, ProfileRecord]; images: [ImageAsset, ImageAsset] }>()
</script>
<template>
  <section id="profile" class="profiles-section" tabindex="-1" aria-label="Bride and groom profiles">
    <div v-for="(profile, index) in profiles" :key="profile.id" class="profile-scene"><ProfileCard :profile="profile" :image="images[index]!" /></div>
  </section>
</template>
