<script setup lang="ts">
import { reactive } from 'vue'
import InvitationFormField from '../invitation/shared/InvitationFormField.vue'
import InvitationFormAction from '../invitation/shared/InvitationFormAction.vue'
import InvitationFormStatus from '../invitation/shared/InvitationFormStatus.vue'
const props = defineProps<{ busy: boolean; available: boolean; message: string }>()
const emit = defineEmits<{ login: [credentials: { email: string; password: string }] }>()
const draft = reactive({ email: '', password: '' })
function submit() {
  if (props.busy || !props.available) return
  if (!draft.email.trim() || !draft.password) return
  emit('login', { email: draft.email.trim(), password: draft.password })
  draft.password = ''
}
</script>
<template>
  <form class="invitation-form invitation-form--light admin-login" aria-labelledby="login-title" @submit.prevent="submit">
    <h2 id="login-title">Sign in privately.</h2>
    <p>Use the administrator email and password. Guest information is loaded only after the server authorizes this session.</p>
    <InvitationFormField id="admin-email" v-model="draft.email" number="01" label="Email" type="email" autocomplete="username" required :disabled="busy || !available" />
    <InvitationFormField id="admin-password" v-model="draft.password" number="02" label="Password" type="password" autocomplete="current-password" required :disabled="busy || !available" />
    <InvitationFormAction label="Sign in" busy-label="Checking access…" :busy="busy" :disabled="!available" />
    <InvitationFormStatus :message="message" />
  </form>
</template>
<style scoped>
.admin-login { max-width: 560px; }
h2 { margin: 0 0 18px; font-size: 28px; font-weight: 400; }
p { margin: 0 0 36px; line-height: 1.7; }
</style>
