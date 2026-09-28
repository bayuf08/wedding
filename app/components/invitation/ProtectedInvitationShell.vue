<script setup lang="ts">
import BaseContainer from '../ui/BaseContainer.vue'
import BaseLink from '../ui/BaseLink.vue'

defineProps<{ organizerContact?: string }>()
</script>

<template>
  <main id="main" class="access-shell">
    <BaseContainer>
      <p class="eyebrow">Private invitation</p>
      <h1>This invitation needs an access link</h1>
      <p>Please return to the message from your hosts and use the complete invitation link. It may include a personal access key.</p>
      <BaseLink v-if="organizerContact" :href="organizerContact" variant="secondary">Contact the hosts</BaseLink>
    </BaseContainer>
  </main>
</template>
