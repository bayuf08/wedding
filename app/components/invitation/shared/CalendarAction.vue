<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import type { CalendarRecord } from '../../../types/claire'
import { calendarHandoffUrl, googleCalendarUrl } from '../../../utils/calendar'

const props = defineProps<{ event: CalendarRecord | null }>()
const userAgent = ref('')
const copied = ref(false)
const copyFailed = ref(false)
const android = computed(() => /Android/i.test(userAgent.value))
const webUrl = computed(() => googleCalendarUrl(props.event))
const handoffUrl = computed(() => calendarHandoffUrl(props.event, userAgent.value))
onMounted(() => { userAgent.value = navigator.userAgent })

async function copyLink() {
  copied.value = false
  copyFailed.value = false
  try {
    await navigator.clipboard.writeText(webUrl.value!)
    copied.value = true
  } catch { copyFailed.value = true }
}
</script>
<template>
  <div class="calendar-action">
    <template v-if="handoffUrl">
      <a class="calendar-button" :href="handoffUrl" :target="android ? '_self' : '_blank'" rel="noopener noreferrer" :aria-label="android ? 'Add to Calendar in Google Calendar in your browser' : 'Add to Calendar in Google Calendar (opens in a new tab)'">Add to<br>Calendar</a>
      <details v-if="android" class="calendar-help">
        <summary>Calendar did not open the event?</summary>
        <p>Copy the event link and paste it into your browser. Sign in if asked, review the details, then choose Save. Nothing is saved automatically.</p>
        <button class="text-action" type="button" @click="copyLink">Copy event link</button>
        <p v-if="copied" role="status">Link copied.</p>
        <label v-if="copyFailed">Copy this link manually<input :value="webUrl" readonly aria-label="Event link" @focus="($event.target as HTMLInputElement).select()"></label>
      </details>
    </template>
    <p v-else role="status">Calendar details are not available yet.</p>
  </div>
</template>
<style scoped>
.calendar-help { max-width: 28ch; margin-top: 1rem; font-size: .875rem; line-height: 1.5; }
summary { cursor: pointer; }
.calendar-help p { margin-block: .75rem; }
.calendar-help input { display: block; width: 100%; margin-top: .5rem; }
</style>
