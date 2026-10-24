<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue'
import InvitationDialog from '../shared/InvitationDialog.vue'
import type { BankRecord } from '../../../types/claire'
const props = defineProps<{ open: boolean; banks: BankRecord[]; guestName: string }>()
const emit = defineEmits<{ close: [] }>()
const draft = reactive({ name: '', bankId: '', amount: '', note: '' })
const errors = reactive({ name: '', bankId: '', amount: '' })
const status = ref('')
const copyStatus = ref('')
async function copy(account: string) { try { await navigator.clipboard.writeText(account); copyStatus.value = 'Copied' } catch { copyStatus.value = 'Select the account number to copy it.' } }
async function submit() {
  status.value = ''
  errors.name = draft.name.trim() ? '' : 'Enter your name.'
  errors.bankId = props.banks.some(bank => bank.id === draft.bankId) ? '' : 'Select a recipient bank.'
  errors.amount = Number.isFinite(Number(draft.amount)) && Number(draft.amount) > 0 ? '' : 'Enter a positive amount.'
  if (errors.name || errors.bankId || errors.amount) { await nextTick(); document.getElementById(errors.name ? 'gift-name' : errors.bankId ? 'gift-bank' : 'gift-amount')?.focus(); return }
  status.value = 'Preview confirmation recorded on this page only.'
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
      </div>
      <div class="gift-form-panel">
        <h2 id="gift-confirm-title" class="gift-dialog-title">Confirm</h2>
        <form class="invitation-form invitation-form--light" aria-labelledby="gift-confirm-title" novalidate @submit.prevent="submit">
          <div class="invitation-field">
            <label class="invitation-label" for="gift-name"><span class="field-number" aria-hidden="true">01</span> Full Name <span class="field-detail">Required</span></label>
            <input id="gift-name" v-model="draft.name" autocomplete="name" required :placeholder="guestName" :aria-invalid="Boolean(errors.name)" :aria-describedby="errors.name ? 'gift-name-error' : undefined">
            <p v-if="errors.name" id="gift-name-error" class="field-error" role="alert">{{ errors.name }}</p>
          </div>
          <div class="invitation-field">
            <label class="invitation-label" for="gift-bank"><span class="field-number" aria-hidden="true">02</span> Recipient Bank <span class="field-detail">Required</span></label>
            <select id="gift-bank" v-model="draft.bankId" required :aria-invalid="Boolean(errors.bankId)" :aria-describedby="errors.bankId ? 'gift-bank-error' : undefined">
              <option value="">Select recipient bank</option>
              <option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.bank }} · {{ bank.holder }}</option>
            </select>
            <p v-if="errors.bankId" id="gift-bank-error" class="field-error" role="alert">{{ errors.bankId }}</p>
          </div>
          <div class="invitation-field">
            <label class="invitation-label" for="gift-amount"><span class="field-number" aria-hidden="true">03</span> Amount <span class="field-detail">Required</span></label>
            <input id="gift-amount" v-model="draft.amount" type="number" min="0.01" step="0.01" inputmode="decimal" placeholder="Enter amount" required :aria-invalid="Boolean(errors.amount)" :aria-describedby="errors.amount ? 'gift-amount-error' : undefined">
            <p v-if="errors.amount" id="gift-amount-error" class="field-error" role="alert">{{ errors.amount }}</p>
          </div>
          <div class="invitation-field">
            <label class="invitation-label" for="gift-note"><span class="field-number" aria-hidden="true">04</span> Note <span class="field-detail">Optional</span></label>
            <textarea id="gift-note" v-model="draft.note" placeholder="Add a note..." />
          </div>
          <button class="form-submit" type="submit">Send Gift Confirmation</button>
          <p class="form-status" role="status">{{ status }}</p>
        </form>
      </div>
    </div>
  </InvitationDialog>
</template>
