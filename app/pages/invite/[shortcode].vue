<script setup lang="ts">
import { computed } from 'vue'
import InvitationExperience from '../../components/invitation/InvitationExperience.vue'
import InvitationUnavailable from '../../components/invitation/InvitationUnavailable.vue'
import ProtectedInvitationShell from '../../components/invitation/ProtectedInvitationShell.vue'
import { resolveInvitationRoute } from '../../utils/invitation-route'
import { guestNameFromQuery } from '../../utils/guest-name'

const route = useRoute()
const invitationRoute = computed(() => resolveInvitationRoute(String(route.params.shortcode ?? '')))
const token = computed(() => /^[a-f0-9]{64}$/.test(String(route.params.shortcode)) ? String(route.params.shortcode) : '')
const { data: guest, status: guestStatus } = await useAsyncData(() => `invitation-guest-${token.value}`,  () => token.value ? $fetch<{ name: string; maxAttendees: number }>(`/api/invitations/${token.value}`) : Promise.resolve(null), { watch: [token] })
const guestName = computed(() => token.value ? guest.value?.name || '' : guestNameFromQuery(route.query.to))
const ready = computed(() => token.value && guestStatus.value === 'success' && guest.value ? resolveInvitationRoute('demo') : invitationRoute.value)
useHead({ meta: [{ name: 'robots', content: 'noindex,nofollow' }, { name: 'referrer', content: 'no-referrer' }] })
</script>

<template>
  <InvitationExperience v-if="ready.kind === 'ready'" :invitation="ready.invitation" :invitation-token="token && guest ? token : undefined" :guest-limit="guest?.maxAttendees" :guest-name="guestName" />
  <ProtectedInvitationShell v-else-if="invitationRoute.kind === 'protected'" />
  <InvitationUnavailable v-else :state="invitationRoute.accessState" />
</template>
