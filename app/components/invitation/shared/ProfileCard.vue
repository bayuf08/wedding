<script setup lang="ts">
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset, ProfileRecord } from '../../../types/claire'
import { toSafeExternalUrl } from '../../../utils/safe-url'
defineProps<{ profile: ProfileRecord; image: ImageAsset }>()
</script>
<template>
  <article class="profile-card" :aria-labelledby="`${profile.id}-name`">
    <p class="profile-role claire-body">{{ profile.role }}</p>
    <div class="profile-portrait reveal-frame"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 300px" /></div>
    <div class="profile-bio">
      <h3 :id="`${profile.id}-name`" class="profile-name claire-serif motion-entry" data-entry="heading"><span>({{ profile.nickname }})</span><br>{{ profile.fullName }}</h3>
      <div class="profile-bottom claire-body motion-entry">
        <p v-for="line in profile.parentLines" :key="line">{{ line }}</p>
        <a v-if="toSafeExternalUrl(profile.socialUrl, 'contact')" :href="toSafeExternalUrl(profile.socialUrl, 'contact') || undefined" target="_blank" rel="noopener noreferrer" class="profile-social">{{ profile.socialHandle || '@instagram' }} <span aria-hidden="true">↗</span></a>
      </div>
    </div>
  </article>
</template>
