<script setup lang="ts">
import { computed, nextTick, reactive, ref } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
import type { RsvpDraft, RsvpErrors } from '../../../types/invitation'
import { codePointLength, validateRsvpDraft } from '../../../utils/rsvp'
const props = defineProps<{ rsvp: ClaireContent['rsvp']; image: ImageAsset; guestName: string }>()
const draft = reactive<RsvpDraft>({})
const errors = ref<RsvpErrors>({})
const status = ref('')
const busy = ref(false)
const nameLength = computed(() => codePointLength(props.guestName))
const noteLength = computed(() => codePointLength(draft.note || ''))
async function submit() {
  errors.value = validateRsvpDraft(draft)
  const firstError = Object.keys(errors.value)[0]
  if (firstError) { await nextTick(); document.getElementById(`rsvp-${firstError}`)?.focus(); return }
  busy.value = true; status.value = ''
  setTimeout(() => { busy.value = false; status.value = 'Your response is saved for this preview.' }, 240)
}
</script>
<template>
  <section id="rsvp" class="rsvp-section" tabindex="-1" aria-labelledby="rsvp-title">
    <div class="scene-container rsvp-layout"><div class="rsvp-image motion-entry"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 427px" /></div>
      <div class="rsvp-column"><h2 id="rsvp-title" class="rsvp-intro claire-body">{{ rsvp.introduction }}</h2>
        <form class="rsvp-form" novalidate @submit.prevent="submit">
          <div class="rsvp-field"><label for="rsvp-name">Full Name <b>*</b> <small>(Auto-filled from URL) ({{ nameLength }}/100)</small></label><input id="rsvp-name" :value="guestName" readonly aria-readonly="true" aria-describedby="rsvp-name-help"><p id="rsvp-name-help" class="rsvp-name-help">This name is taken from the URL parameter and cannot be changed.</p></div>
          <div class="rsvp-field"><label for="rsvp-attendance">Attendance Status <b>*</b></label><select id="rsvp-attendance" v-model="draft.attendance" :aria-invalid="Boolean(errors.attendance)" :aria-describedby="errors.attendance ? 'rsvp-attendance-error' : undefined"><option :value="undefined">Select attendance status</option><option value="ATTENDING">Attending</option><option value="NOT_ATTENDING">Not Attending</option></select><p v-if="errors.attendance" id="rsvp-attendance-error" class="field-error">Please select your attendance status.</p></div>
          <template v-if="draft.attendance === 'ATTENDING'"><div class="rsvp-field"><label for="rsvp-eventId">Select Event <b>*</b></label><select id="rsvp-eventId" v-model="draft.eventId" :aria-invalid="Boolean(errors.eventId)" :aria-describedby="errors.eventId ? 'rsvp-eventId-error' : undefined"><option :value="undefined">Select event</option><option value="matrimony">Akad Nikah</option><option value="reception">Resepsi</option></select><p v-if="errors.eventId" id="rsvp-eventId-error" class="field-error">Please select an event.</p></div><div class="rsvp-field"><label for="rsvp-attendanceCount">Number of Guests <b>*</b></label><select id="rsvp-attendanceCount" v-model.number="draft.attendanceCount" :aria-invalid="Boolean(errors.attendanceCount)" :aria-describedby="errors.attendanceCount ? 'rsvp-attendanceCount-error' : undefined"><option :value="undefined">Select number of guests</option><option :value="1">1</option><option :value="2">2</option></select><p v-if="errors.attendanceCount" id="rsvp-attendanceCount-error" class="field-error">Please choose one or two guests.</p></div></template>
          <div class="rsvp-field"><label for="rsvp-note">Wishes/Message <small>({{ noteLength }}/500)</small></label><textarea id="rsvp-note" v-model="draft.note" placeholder="Write your wishes or message..." :aria-invalid="Boolean(errors.note)" :aria-describedby="errors.note ? 'rsvp-note-error' : undefined" /><p v-if="errors.note" id="rsvp-note-error" class="field-error">Please keep your message under 500 characters.</p></div>
          <button type="submit" class="rsvp-submit" :disabled="busy">{{ busy ? 'Saving…' : 'Send Confirmation' }}</button><p v-if="status" role="status" class="form-status">{{ status }}</p>
        </form>
      </div>
    </div>
  </section>
</template>
