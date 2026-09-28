<script setup lang="ts">
import { computed } from 'vue'
import InvitationExperience from '../../components/invitation/InvitationExperience.vue'
import InvitationUnavailable from '../../components/invitation/InvitationUnavailable.vue'
import ProtectedInvitationShell from '../../components/invitation/ProtectedInvitationShell.vue'
import { resolveInvitationRoute } from '../../utils/invitation-route'
import { guestNameFromQuery } from '../../utils/guest-name'

const route = useRoute()
const invitationRoute = computed(() => resolveInvitationRoute(String(route.params.shortcode ?? '')))
const guestName = computed(() => guestNameFromQuery(route.query.to))
</script>

<template>
  <InvitationExperience v-if="invitationRoute.kind === 'ready'" :invitation="invitationRoute.invitation" :guest-name="guestName" />
  <ProtectedInvitationShell v-else-if="invitationRoute.kind === 'protected'" />
  <InvitationUnavailable v-else :state="invitationRoute.accessState" />
</template>
