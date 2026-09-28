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
  errors.name = draft.name.trim() ? '' : 'Enter your name.'
  errors.bankId = props.banks.some(bank => bank.id === draft.bankId) ? '' : 'Select a recipient bank.'
  errors.amount = Number.isFinite(Number(draft.amount)) && Number(draft.amount) > 0 ? '' : 'Enter a positive amount.'
  if (errors.name || errors.bankId || errors.amount) { await nextTick(); document.getElementById(errors.name ? 'gift-name' : errors.bankId ? 'gift-bank' : 'gift-amount')?.focus(); return }
  status.value = 'Preview confirmation recorded on this page only.'
}
</script>
<template>
  <InvitationDialog :open="open" label="Wedding gift" tone="light" @close="emit('close')"><button type="button" class="dialog-close" data-dialog-initial aria-label="Close gift panel" @click="emit('close')">×</button><div class="gift-dialog-layout scene-container"><div><h2 class="gift-dialog-title">Bank Account</h2><div class="bank-list"><div v-for="bank in banks" :key="bank.id" class="bank-row"><div><strong>{{ bank.holder }}</strong><small>{{ bank.bank }}</small><span class="bank-number">{{ bank.account }}</span></div><button type="button" :aria-label="`Copy ${bank.bank} account number`" @click="copy(bank.account)">Copy</button></div></div><p v-if="copyStatus" role="status">{{ copyStatus }}</p></div><div class="gift-form-panel"><h2 class="gift-dialog-title">Confirm</h2><form novalidate @submit.prevent="submit"><label for="gift-name">Full Name</label><input id="gift-name" v-model="draft.name" :placeholder="guestName" :aria-invalid="Boolean(errors.name)"><p v-if="errors.name" class="field-error">{{ errors.name }}</p><label for="gift-bank">Recipient Bank</label><select id="gift-bank" v-model="draft.bankId" :aria-invalid="Boolean(errors.bankId)"><option value="">Select recipient bank</option><option v-for="bank in banks" :key="bank.id" :value="bank.id">{{ bank.bank }} — {{ bank.holder }}</option></select><p v-if="errors.bankId" class="field-error">{{ errors.bankId }}</p><label for="gift-amount">Amount</label><input id="gift-amount" v-model="draft.amount" type="number" min="0.01" step="0.01" inputmode="decimal" :aria-invalid="Boolean(errors.amount)"><p v-if="errors.amount" class="field-error">{{ errors.amount }}</p><label for="gift-note">Note (optional)</label><textarea id="gift-note" v-model="draft.note" /><button type="submit">SEND</button><p v-if="status" role="status">{{ status }}</p></form></div></div></InvitationDialog>
</template>
