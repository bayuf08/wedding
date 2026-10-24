<script setup lang="ts">
import { $fetch } from 'ofetch'
import { computed, nextTick, reactive, ref, watch } from 'vue'
import InvitationFormField from '../shared/InvitationFormField.vue'
import InvitationFormChoices from '../shared/InvitationFormChoices.vue'
import InvitationFormAction from '../shared/InvitationFormAction.vue'
import InvitationFormStatus from '../shared/InvitationFormStatus.vue'
import InvitationFormCompanion from '../shared/InvitationFormCompanion.vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
import type { RsvpDraft, RsvpErrors } from '../../../types/invitation'
import { codePointLength, createWeddingRsvpDraft, normalizeRsvpSubmission, validateRsvpDraft } from '../../../utils/rsvp'
import { createInvitationDelivery } from '../../../utils/invitation-delivery'
const props = defineProps<{ rsvp: ClaireContent['rsvp']; image: ImageAsset; guestName: string; eventId?: RsvpDraft['eventId']; invitationToken?: string; guestLimit?: number }>()
const deliver = createInvitationDelivery((url, options) => $fetch(url, options), () => props.invitationToken, 'rsvps')
const limit = computed(() => props.guestLimit || 2)
const emit = defineEmits<{ previewSubmit: [payload: RsvpDraft] }>()
const draft = reactive<RsvpDraft>(createWeddingRsvpDraft(props.eventId))
const errors = ref<RsvpErrors>({})
const status = ref('')
const activeField = ref('RSVP')
const busy = ref(false)
const nameLength = computed(() => codePointLength(props.guestName))
const noteLength = computed(() => codePointLength(draft.note || ''))
async function submit() {
  if (busy.value) return
  status.value = ''
  const payload = normalizeRsvpSubmission(draft)
  errors.value = validateRsvpDraft(payload)
  if (payload.attendance === 'ATTENDING' && (payload.attendanceCount || 0) > limit.value) errors.value.attendanceCount = 'attending_count_invalid'
  const firstError = Object.keys(errors.value)[0]
  if (firstError) { await nextTick(); document.getElementById(`rsvp-${firstError}`)?.focus(); return }
  emit('previewSubmit', payload)
  busy.value = true; status.value = ''
  try { if (!props.invitationToken) await new Promise(resolve => setTimeout(resolve, 240)); status.value = await deliver(payload as Record<string, unknown>) ? 'Your RSVP has been saved. Thank you.' : 'RSVP details checked on this page. Nothing has been sent or saved.' }
  catch (error) { status.value = error instanceof Error && error.message.startsWith('A previous') ? error.message : 'Unable to confirm delivery. Retry the same details.' }
  finally { busy.value = false }
}
function setAttendance(value: string | number) {
  if (value === 'ATTENDING' || value === 'NOT_ATTENDING') draft.attendance = value
}
function setGuestCount(value: string | number) {
  draft.attendanceCount = Number(value)
  if (errors.value.attendanceCount) errors.value = validateRsvpDraft(normalizeRsvpSubmission(draft))
}
watch(() => draft.attendance, attendance => {
  status.value = ''
  const { attendanceCount, eventId, ...otherErrors } = errors.value
  errors.value = attendance === 'NOT_ATTENDING' ? otherErrors : { ...otherErrors, ...validateRsvpDraft(draft) }
})
watch(() => props.eventId, eventId => { draft.eventId = eventId })
</script>
<template>
  <section id="rsvp" class="rsvp-section" tabindex="-1" aria-labelledby="rsvp-title">
    <div class="scene-container rsvp-layout">
      <div class="rsvp-visual-column">
        <div class="rsvp-image motion-entry"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 427px" /></div>
        <InvitationFormCompanion :text="activeField" />
      </div>
      <div class="rsvp-column">
        <h2 id="rsvp-title" class="rsvp-intro claire-body">{{ rsvp.introduction }}</h2>
        <form class="rsvp-form invitation-form" novalidate :aria-busy="busy" aria-labelledby="rsvp-title" @submit.prevent="submit">
          <InvitationFormField id="rsvp-name" number="01" label="Full Name" :model-value="guestName" readonly :detail="`${nameLength}/100`" help="This name is taken from your invitation link and cannot be changed." @activate="activeField = $event" />
          <InvitationFormChoices id="rsvp-attendance" :model-value="draft.attendance" number="02" label="Attendance Status" name="attendance" required :options="[{ value: 'ATTENDING', label: 'Attending' }, { value: 'NOT_ATTENDING', label: 'Not Attending' }]" :error="errors.attendance ? 'Please select your attendance status.' : undefined" @update:model-value="setAttendance" @activate="activeField = $event" />
          <InvitationFormChoices v-if="draft.attendance === 'ATTENDING'" id="rsvp-attendanceCount" :model-value="draft.attendanceCount" number="03" label="Number of Attendance" name="attendance-count" required :options="Array.from({ length: limit }, (_, i) => ({ value: i + 1, label: String(i + 1) }))" :error="errors.attendanceCount ? `Please choose ${limit === 1 ? '1 attendee' : '1 or 2 attendees'}.` : undefined" @update:model-value="setGuestCount" @activate="activeField = $event" />
          <InvitationFormField id="rsvp-note" v-model="draft.note" :number="draft.attendance === 'ATTENDING' ? '04' : '03'" label="Wishes/Message" type="textarea" detail="Optional" placeholder="Write your wishes or message..." :help="`${noteLength}/500 characters`" :error="errors.note ? 'Please keep your message under 500 characters.' : undefined" @activate="activeField = $event" />
          <p v-if="!eventId" class="field-error" role="alert">Attendance confirmation is unavailable because no event is configured.</p>
          <InvitationFormAction :label="invitationToken ? 'Send RSVP' : 'Review RSVP'" :busy="busy" :disabled="!eventId" />
          <InvitationFormStatus :message="status" />
        </form>
      </div>
    </div>
  </section>
</template>
