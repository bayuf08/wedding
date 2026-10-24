<script setup lang="ts">
import { $fetch } from 'ofetch'
import { nextTick, reactive, ref } from 'vue'
import InvitationFormField from '../shared/InvitationFormField.vue'
import InvitationFormChoices from '../shared/InvitationFormChoices.vue'
import InvitationFormAction from '../shared/InvitationFormAction.vue'
import InvitationFormStatus from '../shared/InvitationFormStatus.vue'
import InvitationFormCompanion from '../shared/InvitationFormCompanion.vue'
import InvitationDialog from '../shared/InvitationDialog.vue'
import type { BankRecord } from '../../../types/claire'
import { createInvitationDelivery } from '../../../utils/invitation-delivery'
const props = defineProps<{ open: boolean; banks: BankRecord[]; guestName: string; invitationToken?: string }>()
const deliver = createInvitationDelivery((url, options) => $fetch(url, options), () => props.invitationToken, 'gift-confirmations')
const busy = ref(false)
const emit = defineEmits<{ close: [] }>()
const draft = reactive({ name: '', bankId: '', amount: '', note: '' })
const errors = reactive({ name: '', bankId: '', amount: '' })
const status = ref('')
const activeField = ref('With love')
const copyStatus = ref('')
async function copy(account: string) { try { await navigator.clipboard.writeText(account); copyStatus.value = 'Copied' } catch { copyStatus.value = 'Select the account number to copy it.' } }
async function submit() {
  if (busy.value) return
  status.value = ''
  errors.name = (props.invitationToken ? props.guestName : draft.name).trim() && Array.from(draft.name).length <= 100 ? '' : 'Enter your name (up to 100 characters).'
  errors.bankId = props.banks.some(bank => bank.id === draft.bankId) ? '' : 'Select a recipient bank.'
  errors.amount = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(draft.amount) && Number(draft.amount) > 0 ? '' : 'Enter a positive amount.'
  if (errors.name || errors.bankId || errors.amount) { await nextTick(); document.getElementById(errors.name ? 'gift-name' : errors.bankId ? 'gift-bank' : 'gift-amount')?.focus(); return }
  if (Array.from(draft.note).length > 500) { status.value = 'Please keep your note under 500 characters.'; return }
  busy.value = true
  try { status.value = await deliver({ bankId: draft.bankId, amount: draft.amount, note: draft.note }) ? 'Your gift confirmation has been saved. Thank you.' : 'Gift details checked on this page. Nothing has been sent or saved.' }
  catch (error) { status.value = error instanceof Error && error.message.startsWith('A previous') ? error.message : 'Unable to confirm delivery. Retry the same details.' }
  finally { busy.value = false }
}
</script>
<template>
  <InvitationDialog :open="open" label="Wedding gift" tone="light" @close="emit('close')">
    <button type="button" class="dialog-close" data-dialog-initial aria-label="Close gift panel" @click="emit('close')">×</button>
    <div class="gift-dialog-layout scene-container">
      <div>
        <h2 class="gift-dialog-title">Bank Account</h2>
        <div class="bank-list">
          <div v-for="bank in banks" :key="bank.id" class="bank-row">
            <div><strong>{{ bank.holder }}</strong><small>{{ bank.bank }}</small><span class="bank-number">{{ bank.account }}</span></div>
            <button type="button" :aria-label="`Copy ${bank.bank} account number`" @click="copy(bank.account)">Copy</button>
          </div>
        </div>
        <p role="status">{{ copyStatus }}</p>
        <InvitationFormCompanion :text="activeField" />
      </div>
      <div class="gift-form-panel">
        <h2 id="gift-confirm-title" class="gift-dialog-title">Confirm</h2>
        <form class="invitation-form invitation-form--light" aria-labelledby="gift-confirm-title" novalidate @submit.prevent="submit">
          <InvitationFormField id="gift-name" :model-value="invitationToken ? guestName : draft.name" :readonly="!!invitationToken" @update:model-value="draft.name = $event" number="01" label="Full Name" autocomplete="name" required :placeholder="guestName" :error="errors.name" @activate="activeField = $event" />
          <InvitationFormChoices id="gift-bank" :model-value="draft.bankId" @update:model-value="draft.bankId = String($event)" number="02" label="Recipient Bank" name="recipient" required :options="banks.map(bank => ({ value: bank.id, label: `${bank.bank} · ${bank.holder}` }))" :error="errors.bankId" @activate="activeField = $event" />
          <InvitationFormField id="gift-amount" v-model="draft.amount" number="03" label="Amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="Enter amount" required :error="errors.amount" @activate="activeField = $event" />
          <InvitationFormField id="gift-note" v-model="draft.note" number="04" label="Note" type="textarea" detail="Optional" placeholder="Add a note..." @activate="activeField = $event" />
          <InvitationFormAction :busy="busy" :label="invitationToken ? 'Send Gift Confirmation' : 'Review Gift Confirmation'" />
          <InvitationFormStatus :message="status" />
        </form>
      </div>
    </div>
  </InvitationDialog>
</template>
