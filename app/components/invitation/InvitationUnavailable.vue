<script setup lang="ts">
import { computed } from 'vue'
import BaseContainer from '../ui/BaseContainer.vue'
import BaseLink from '../ui/BaseLink.vue'
import type { AccessState } from '../../types/invitation'

const props = defineProps<{ state: AccessState; organizerContact?: string }>()
const copy = computed(() => {
  if (props.state === 'DEPENDENCY_UNAVAILABLE') {
    return { title: 'The invitation service is temporarily unavailable', detail: 'Please try again in a moment. Your invitation has not been changed.' }
  }
  if (props.state === 'EXPIRED') return { title: 'This invitation link has expired', detail: 'Please contact the hosts if you need a current invitation.' }
  if (props.state === 'REVOKED') return { title: 'This invitation is no longer active', detail: 'Please contact the hosts if you think this is unexpected.' }
  return { title: 'This invitation is unavailable', detail: 'Please check the link or contact the hosts for help.' }
})
</script>

<template>
  <main id="main" class="access-shell">
    <BaseContainer>
      <p class="eyebrow">Invitation access</p>
      <h1>{{ copy.title }}</h1>
      <p>{{ copy.detail }}</p>
      <BaseLink v-if="state === 'DEPENDENCY_UNAVAILABLE'" href="" variant="secondary">Try again</BaseLink>
      <BaseLink v-else-if="organizerContact" :href="organizerContact" variant="secondary">Contact the hosts</BaseLink>
    </BaseContainer>
  </main>
</template>
