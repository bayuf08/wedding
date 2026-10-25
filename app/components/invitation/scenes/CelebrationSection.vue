<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import MarqueeStrip from '../shared/MarqueeStrip.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
import CalendarAction from '../shared/CalendarAction.vue'
const props = defineProps<{ celebration: ClaireContent['celebration']; image: ImageAsset }>()
const countdown = ref([
  { label: 'D', value: '00' },
  { label: 'H', value: '00' },
  { label: 'M', value: '00' },
  { label: 'S', value: '00' },
])
let countdownTimer: ReturnType<typeof setInterval> | undefined

function updateCountdown() {
  const startsAt = props.celebration.calendar?.startsAt
  const milliseconds = startsAt ? Math.max(0, new Date(startsAt).getTime() - Date.now()) : 0
  const totalSeconds = Math.floor(milliseconds / 1000)
  const days = Math.floor(totalSeconds / 86_400)
  const hours = Math.floor(totalSeconds % 86_400 / 3_600)
  const minutes = Math.floor(totalSeconds % 3_600 / 60)
  const seconds = totalSeconds % 60
  countdown.value = [
    { label: 'D', value: String(days).padStart(2, '0') },
    { label: 'H', value: String(hours).padStart(2, '0') },
    { label: 'M', value: String(minutes).padStart(2, '0') },
    { label: 'S', value: String(seconds).padStart(2, '0') },
  ]
}

onMounted(() => {
  updateCountdown()
  countdownTimer = setInterval(updateCountdown, 1_000)
})
onBeforeUnmount(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})

</script>
<template>
  <section class="celebration-section" aria-label="Almost time for our celebration">
    <div class="celebration-image-wrap"><MarqueeStrip :text="celebration.ribbon" muted /><div class="celebration-portrait"><ResponsivePhoto :asset="image" sizes="335px" /></div></div>
    <div class="celebration-lower scene-container motion-entry">
      <div class="countdown" :aria-label="`Countdown: ${countdown[0]!.value} days, ${countdown[1]!.value} hours, ${countdown[2]!.value} minutes and ${countdown[3]!.value} seconds`"><span v-for="unit in countdown" :key="unit.label" class="countdown-pair"><span class="claire-countdown">{{ unit.value }}</span><small>{{ unit.label }}</small></span></div>
      <CalendarAction :event="celebration.calendar" />
    </div>
  </section>
</template>
