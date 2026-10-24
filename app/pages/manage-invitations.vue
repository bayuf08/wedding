<script setup lang="ts">
import { $fetch } from 'ofetch'
import { onMounted, ref } from 'vue'
import InvitationWorkspace from '../components/admin/InvitationWorkspace.vue'
import InvitationAdminLogin from '../components/admin/InvitationAdminLogin.vue'
import { createInvitationAdminGateway } from '../utils/invitation-admin-gateway'
import type { InvitationAdminAccess } from '../types/invitation-admin'
useHead({ title: 'Private invitation management', meta: [{ name: 'robots', content: 'noindex,nofollow,noarchive' }] })
const event = useRequestEvent()
const access = useState<InvitationAdminAccess>('invitation-admin-access', () => event?.context.invitationAdminAccess || { status: 'unavailable' })
const busy = ref(false), message = ref(''), csrf = ref('')
const gateway = createInvitationAdminGateway($fetch, () => csrf.value)
async function checkSession() {
  try {
    const result = await $fetch<{ authorized: boolean; csrfToken: string }>('/manage-invitations/api/session', { credentials: 'include' })
    if (result.authorized && /^[a-f0-9]{64}$/.test(result.csrfToken)) { csrf.value = result.csrfToken; access.value = { status: 'authorized' } }
    else access.value = { status: 'unavailable' }
  } catch (error: unknown) {
    const status = (error as { statusCode?: number }).statusCode
    access.value = { status: status === 401 ? 'unauthenticated' : status === 403 ? 'forbidden' : 'unavailable' }
  }
}
onMounted(checkSession)
async function login(credentials: { email: string; password: string }) {
  if (busy.value) return
  busy.value = true; message.value = ''
  try { await $fetch('/manage-invitations/api/login', { method: 'POST', credentials: 'include', body: credentials }); await checkSession() }
  catch (error: unknown) {
    const status = (error as { statusCode?: number }).statusCode
    message.value = status === 401 ? 'Email or password is incorrect.' : status === 429 ? 'Too many attempts. Please try again later.' : 'Secure sign-in is not configured yet. Nothing was saved.'
  } finally { credentials.password = ''; busy.value = false }
}
async function logout() {
  busy.value = true; message.value = ''
  try { await $fetch('/manage-invitations/api/logout', { method: 'POST', credentials: 'include', headers: { 'X-CSRF-Token': csrf.value } }); csrf.value = ''; access.value = { status: 'unauthenticated' } }
  catch { message.value = 'Unable to confirm sign-out. Try again.' }
  finally { busy.value = false }
}
</script>
<template>
  <main id="main" tabindex="-1" class="invitation-admin-page" aria-labelledby="admin-title">
    <header class="admin-header"><div><p class="admin-eyebrow">Bayu &amp; Hilwa / Private workspace</p><h1 id="admin-title">Your guest list.</h1></div><button v-if="access.status === 'authorized'" type="button" :disabled="busy || !csrf" @click="logout">Sign out</button></header>
    <InvitationWorkspace v-if="access.status === 'authorized' && csrf" :gateway="gateway" />
    <template v-else>
      <div v-if="access.status === 'unavailable'" class="admin-access-note" role="status"><h2>Secure access is not available yet.</h2><p>Sign-in is waiting for private backend configuration. No guest information has been loaded. Adding and importing invitations remain locked.</p><button type="button" @click="checkSession">Check access again</button></div>
      <div v-else-if="access.status === 'forbidden'" class="admin-access-note" role="alert">This session does not have permission to manage invitations.</div>
      <InvitationAdminLogin :busy="busy" :available="access.status === 'unauthenticated'" :message="message" @login="login" />
    </template>
    <p v-if="access.status === 'authorized' && message" role="status">{{ message }}</p>
    <NuxtLink class="admin-back" to="/invite/demo">Back to the invitation</NuxtLink>
  </main>
</template>
<style scoped>
.invitation-admin-page { min-height: 100dvh; padding: clamp(32px, 6vw, 80px) max(24px, calc((100vw - 1140px) / 2)); color: #26221f; background: #f0efed; }
.admin-header { display: flex; justify-content: space-between; align-items: start; gap: 20px; margin-bottom: 44px; }
.admin-eyebrow { font: 400 11px/1.6 ui-monospace, Menlo, monospace; text-transform: uppercase; }
h1 { margin: 24px 0; font: 400 clamp(42px, 6vw, 76px)/1.1 'Playfair Display', Georgia, serif; letter-spacing: -.025em; }
.admin-access-note { max-width: 660px; padding: 24px 0; margin: 0 0 40px; border-block: 1px solid #81766d; }
h2 { margin: 0 0 12px; font-size: 20px; font-weight: 400; }
p { line-height: 1.7; }
button { min-height: 44px; padding: 10px 14px; border: 1px solid #655c55; color: inherit; background: transparent; }
button:disabled { opacity: .5; }
.admin-back { display: inline-flex; align-items: center; min-height: 44px; margin-top: 44px; font-size: 14px; }
@media(max-width: 480px) { .admin-header { flex-wrap: wrap; } }
</style>
