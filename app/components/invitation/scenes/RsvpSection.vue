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
  if (busy.value) return
  status.value = ''
  errors.value = validateRsvpDraft(draft)
  const firstError = Object.keys(errors.value)[0]
  if (firstError) { await nextTick(); document.getElementById(`rsvp-${firstError}`)?.focus(); return }
  busy.value = true; status.value = ''
  setTimeout(() => { busy.value = false; status.value = 'Your response is saved for this preview.' }, 240)
}
</script>
<template>
  <section id="rsvp" class="rsvp-section" tabindex="-1" aria-labelledby="rsvp-title">
    <div class="scene-container rsvp-layout">
      <div class="rsvp-image motion-entry"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 427px" /></div>
      <div class="rsvp-column">
        <h2 id="rsvp-title" class="rsvp-intro claire-body">{{ rsvp.introduction }}</h2>
        <form class="rsvp-form invitation-form" novalidate :aria-busy="busy" aria-labelledby="rsvp-title" @submit.prevent="submit">
          <div class="invitation-field">
            <label class="invitation-label" for="rsvp-name"><span class="field-number" aria-hidden="true">01</span> Full Name <span class="field-detail">{{ nameLength }}/100</span></label>
            <input id="rsvp-name" :value="guestName" readonly aria-readonly="true" aria-describedby="rsvp-name-help">
            <p id="rsvp-name-help" class="field-help">This name is taken from your invitation link and cannot be changed.</p>
          </div>
          <fieldset class="invitation-field" :aria-describedby="errors.attendance ? 'rsvp-attendance-error' : undefined">
            <legend class="invitation-label"><span class="field-number" aria-hidden="true">02</span> Attendance Status <span class="field-detail">Required</span></legend>
            <div class="form-choices">
              <label class="form-choice"><input id="rsvp-attendance" v-model="draft.attendance" type="radio" name="attendance" value="ATTENDING" required :aria-invalid="Boolean(errors.attendance)" :aria-describedby="errors.attendance ? 'rsvp-attendance-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>Attending</span></label>
              <label class="form-choice"><input v-model="draft.attendance" type="radio" name="attendance" value="NOT_ATTENDING" required :aria-invalid="Boolean(errors.attendance)" :aria-describedby="errors.attendance ? 'rsvp-attendance-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>Not Attending</span></label>
            </div>
            <p v-if="errors.attendance" id="rsvp-attendance-error" class="field-error" role="alert">Please select your attendance status.</p>
          </fieldset>
          <template v-if="draft.attendance === 'ATTENDING'">
            <fieldset class="invitation-field" :aria-describedby="errors.eventId ? 'rsvp-eventId-error' : undefined">
              <legend class="invitation-label"><span class="field-number" aria-hidden="true">03</span> Select Event <span class="field-detail">Required</span></legend>
              <div class="form-choices">
                <label class="form-choice"><input id="rsvp-eventId" v-model="draft.eventId" type="radio" name="event" value="matrimony" required :aria-invalid="Boolean(errors.eventId)" :aria-describedby="errors.eventId ? 'rsvp-eventId-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>Akad Nikah</span></label>
                <label class="form-choice"><input v-model="draft.eventId" type="radio" name="event" value="reception" required :aria-invalid="Boolean(errors.eventId)" :aria-describedby="errors.eventId ? 'rsvp-eventId-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>Resepsi</span></label>
              </div>
              <p v-if="errors.eventId" id="rsvp-eventId-error" class="field-error" role="alert">Please select an event.</p>
            </fieldset>
            <fieldset class="invitation-field" :aria-describedby="errors.attendanceCount ? 'rsvp-attendanceCount-error' : undefined">
              <legend class="invitation-label"><span class="field-number" aria-hidden="true">04</span> Number of Guests <span class="field-detail">Required</span></legend>
              <div class="form-choices">
                <label class="form-choice"><input id="rsvp-attendanceCount" v-model="draft.attendanceCount" type="radio" name="guests" :value="1" required :aria-invalid="Boolean(errors.attendanceCount)" :aria-describedby="errors.attendanceCount ? 'rsvp-attendanceCount-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>1 guest</span></label>
                <label class="form-choice"><input v-model="draft.attendanceCount" type="radio" name="guests" :value="2" required :aria-invalid="Boolean(errors.attendanceCount)" :aria-describedby="errors.attendanceCount ? 'rsvp-attendanceCount-error' : undefined"><span><i class="choice-check" aria-hidden="true">✓</i>2 guests</span></label>
              </div>
              <p v-if="errors.attendanceCount" id="rsvp-attendanceCount-error" class="field-error" role="alert">Please choose one or two guests.</p>
            </fieldset>
          </template>
          <div class="invitation-field">
            <label class="invitation-label" for="rsvp-note"><span class="field-number" aria-hidden="true">{{ draft.attendance === 'ATTENDING' ? '05' : '03' }}</span> Wishes/Message <span class="field-detail">Optional</span></label>
            <textarea id="rsvp-note" v-model="draft.note" placeholder="Write your wishes or message..." :aria-invalid="Boolean(errors.note)" :aria-describedby="errors.note ? 'rsvp-note-error rsvp-note-help' : 'rsvp-note-help'" />
            <p id="rsvp-note-help" class="field-help">{{ noteLength }}/500 characters</p>
            <p v-if="errors.note" id="rsvp-note-error" class="field-error" role="alert">Please keep your message under 500 characters.</p>
          </div>
          <button type="submit" class="form-submit" :disabled="busy">{{ busy ? 'Saving…' : 'Send Confirmation' }}</button>
          <p class="form-status" role="status">{{ status }}</p>
        </form>
      </div>
    </div>
  </section>
</template>
