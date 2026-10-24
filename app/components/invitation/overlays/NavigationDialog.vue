<script setup lang="ts">
import { ref } from 'vue'
import InvitationBurgerIcon from '../shared/InvitationBurgerIcon.vue'
import NavigationCurtain from '../shared/NavigationCurtain.vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../../types/claire'
import { useNavigationMenu } from '../../../composables/useNavigationMenu'
const props = withDefaults(defineProps<{ open: boolean; image: ImageAsset; motionEnabled?: boolean }>(), { motionEnabled: true })
const emit = defineEmits<{ close: []; navigate: [id: string]; presence: [value: boolean] }>()
const element = ref<HTMLDialogElement | null>(null)
const menu = useNavigationMenu(element, props, { close: () => emit('close'), navigate: id => emit('navigate', id), presence: value => emit('presence', value) })
const { phase, intendedOpen } = menu
const links = [ ['Home', 'welcome'], ['Profile', 'profile'], ['Love Story', 'story'], ['Wedding Event', 'details'], ['RSVP', 'rsvp'], ['Wedding Gift', 'gift'], ['Gallery', 'gallery'] ]
</script>
<template>
  <dialog id="wedding-navigation" ref="element" class="invitation-dialog invitation-dialog--light navigation-dialog" aria-label="Invitation navigation" :data-phase="phase" @cancel.prevent="menu.close" @close="menu.nativeClosed" @pointerdown="menu.pointerDown" @click="menu.click" @focusin="menu.focusIn" @keydown="menu.keyDown">
    <div class="dialog-content">
      <NavigationCurtain />
      <button type="button" class="dialog-close navigation-toggle" data-dialog-initial data-menu-toggle :aria-label="intendedOpen ? 'Close navigation' : 'Open navigation'" :aria-expanded="intendedOpen" aria-controls="wedding-navigation" @click="menu.toggle"><InvitationBurgerIcon :open="intendedOpen" :animated="motionEnabled" /></button>
      <div class="navigation-layout">
        <div class="navigation-photo" data-menu-photo><ResponsivePhoto :asset="image" sizes="411px" alt="" /></div>
        <nav aria-label="Invitation sections">
          <button v-for="[label, id] in links" :key="id" type="button" class="navigation-link claire-serif" @click="menu.navigate(id!)"><span class="navigation-label-mask"><span data-menu-reveal>{{ label }}</span></span></button>
          <p data-menu-caption>Navigate the invitation</p>
        </nav>
      </div>
    </div>
  </dialog>
</template>
<style scoped>
.navigation-dialog { background: transparent; overflow-x: hidden; }
.navigation-layout { position: relative; z-index: 1; }
.navigation-label-mask { display: block; overflow: clip; }
[data-menu-reveal] { display: block; }
.navigation-toggle { --burger-width: 28px; --burger-height: 11px; --burger-stroke: 1.5px; background: #f0f0f0; }
</style>
