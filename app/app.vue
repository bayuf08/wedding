<template>
  <div class="app-shell">
    <a class="skip-link" href="#main">Skip to invitation content</a>
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { invitationSiteHead } from './utils/site-head'
useHead(invitationSiteHead)
useSeoMeta({
  title: 'The Wedding of Bayu - Hilwa',
  description: 'The wedding invitation of Bayu and Hilwa.',
  robots: 'noindex, nofollow',
})
</script>
