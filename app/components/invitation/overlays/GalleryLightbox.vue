<script setup lang="ts">
import { computed, ref } from 'vue'
import InvitationDialog from '../shared/InvitationDialog.vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ImageAsset } from '../../../types/claire'
const props = defineProps<{ open: boolean; images: ImageAsset[]; index: number }>()
const emit = defineEmits<{ close: []; change: [index: number] }>()
const image = computed(() => props.images[props.index])
const stage = ref<HTMLElement | null>(null)
const feedback = ref('')
function change(delta: number) { const index = props.index + delta; if (index >= 0 && index < props.images.length) emit('change', index) }
async function fullscreen() { try { await stage.value?.requestFullscreen() } catch { feedback.value = 'Fullscreen is not available.' } }
function keydown(event: KeyboardEvent) { if (event.key === 'ArrowLeft') { event.preventDefault(); change(-1) } if (event.key === 'ArrowRight') { event.preventDefault(); change(1) } }
</script>
<template>
  <InvitationDialog :open="open" label="Photo gallery" tone="dark" @close="emit('close')"><div class="lightbox" @keydown="keydown"><span class="lightbox-counter">{{ index + 1 }} / {{ images.length }}</span><div class="lightbox-actions"><button type="button" aria-label="Fullscreen photo" @click="fullscreen">⛶</button><button type="button" data-dialog-initial aria-label="Close photo" @click="emit('close')">×</button></div><button type="button" class="lightbox-arrow lightbox-arrow--previous" aria-label="Previous photo" :disabled="index === 0" @click="change(-1)">‹</button><div ref="stage" class="lightbox-stage"><ResponsivePhoto v-if="image" :key="image.id" :asset="image" loading="eager" sizes="100vw" /></div><button type="button" class="lightbox-arrow lightbox-arrow--next" aria-label="Next photo" :disabled="index >= images.length - 1" @click="change(1)">›</button><p v-if="feedback" class="lightbox-feedback" role="status">{{ feedback }}</p></div></InvitationDialog>
</template>
