<script setup lang="ts">
import type { ClaireContent } from '../../../types/claire'
import { toSafeExternalUrl } from '../../../utils/safe-url'
defineProps<{ events: ClaireContent['events'] }>()
</script>
<template>
  <section id="details" class="event-details" tabindex="-1" aria-labelledby="details-title">
    <div class="scene-container event-layout">
      <h2 id="details-title" class="event-label claire-serif motion-entry">Wedding<br>/ Details</h2>
      <div class="event-main">
        <p class="event-date claire-serif motion-entry" data-entry="heading"><span>{{ events.weekday }}</span><span>{{ events.dateLabel }}</span></p>
        <div class="schedule">
          <div v-for="row in events.rows" :id="row.id === 'matrimony' ? 'directions' : undefined" :key="row.id" class="schedule-row motion-entry">
            <h3 class="schedule-label claire-serif">{{ row.label }}</h3>
            <div class="schedule-body claire-body"><p v-for="line in row.lines" :key="line">{{ line }}</p><div v-if="row.colors.length" class="dress-colors"><span v-for="color in row.colors" :key="color.label"><i :style="{ background: color.value }" aria-hidden="true" />{{ color.label }}</span></div></div>
            <a v-if="row.action && toSafeExternalUrl(row.action.url, 'map')" class="schedule-arrow" :href="toSafeExternalUrl(row.action.url, 'map') || undefined" target="_blank" rel="noopener noreferrer" :aria-label="`${row.action.label} (opens in a new tab)`">↗</a>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
