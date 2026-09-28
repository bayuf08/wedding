<script setup lang="ts">
import InvitationDialog from '../shared/InvitationDialog.vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../../types/claire'
defineProps<{ open: boolean; image: ImageAsset }>()
const emit = defineEmits<{ close: []; navigate: [id: string] }>()
const links = [ ['Home', 'welcome'], ['Profile', 'profile'], ['Love Story', 'story'], ['Wedding Event', 'details'], ['RSVP', 'rsvp'], ['Wedding Gift', 'gift'], ['Gallery', 'gallery'] ]
</script>
<template>
  <InvitationDialog :open="open" label="Invitation navigation" tone="light" @close="emit('close')"><button type="button" class="dialog-close" data-dialog-initial aria-label="Close navigation" @click="emit('close')">×</button><div class="navigation-layout"><div class="navigation-photo"><ResponsivePhoto :asset="image" sizes="411px" alt="" /></div><nav aria-label="Invitation sections"><button v-for="[label, id] in links" :key="id" type="button" class="navigation-link claire-serif" @click="emit('navigate', id!)">{{ label }}</button><p>Navigate the invitation</p></nav></div></InvitationDialog>
</template>
