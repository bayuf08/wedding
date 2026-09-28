<script setup lang="ts">
import { nextTick, onBeforeUnmount, ref, watch } from 'vue'
const props = defineProps<{ open: boolean; label: string; tone?: 'light' | 'dark' }>()
const emit = defineEmits<{ close: [] }>()
const element = ref<HTMLDialogElement | null>(null)
let returnFocus: HTMLElement | null = null
watch(() => props.open, async value => {
  await nextTick()
  const dialog = element.value
  if (!dialog) return
  if (value && !dialog.open) {
    returnFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    dialog.showModal()
    ;(dialog.querySelector('[data-dialog-initial]') as HTMLElement | null)?.focus({ preventScroll: true })
  } else if (!value && dialog.open) {
    dialog.close()
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true })
  }
})
onBeforeUnmount(() => { if (element.value?.open) element.value.close() })
function cancel(event: Event) { event.preventDefault(); emit('close') }
</script>
<template>
  <dialog ref="element" class="invitation-dialog" :class="`invitation-dialog--${tone || 'light'}`" :aria-label="label" @cancel="cancel" @close="open && emit('close')"><div class="dialog-content"><slot /></div></dialog>
</template>
