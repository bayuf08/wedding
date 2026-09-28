<script setup lang="ts">
import { computed } from 'vue'
import StatusMessage from '../ui/StatusMessage.vue'
import type { LifecycleState } from '../../types/invitation'

const props = defineProps<{ lifecycle: LifecycleState }>()

const notice = computed<{ title: string; detail: string; tone: 'info' | 'warning' | 'error' } | null>(() => {
  const notices = {
    POSTPONED: { title: 'This celebration has been postponed', detail: 'Please hold this invitation close. Updated details will be shared by the hosts.', tone: 'warning' },
    CANCELLED: { title: 'This celebration will not go ahead', detail: 'We are grateful for your understanding. Please contact the hosts if you need help.', tone: 'error' },
    UPCOMING_RSVP_CLOSED: { title: 'RSVPs are now closed', detail: 'Thank you for keeping us in your plans.', tone: 'info' },
    WEDDING_DAY: { title: 'Today is the day', detail: 'We look forward to welcoming confirmed guests.', tone: 'info' },
    COMPLETED: { title: 'With gratitude', detail: 'Thank you for being part of this chapter.', tone: 'info' },
    ARCHIVED: { title: 'This invitation has been archived', detail: 'Please contact the hosts with any questions.', tone: 'info' },
  } as const

  return notices[props.lifecycle as keyof typeof notices] ?? null
})
</script>

<template>
  <StatusMessage v-if="notice" :title="notice.title" :detail="notice.detail" :tone="notice.tone" />
</template>
