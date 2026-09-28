<script setup lang="ts">
defineProps<{ paused: boolean; mediaAvailable: boolean }>()
defineEmits<{ menu: []; pause: [] }>()
</script>
<template>
  <div class="invitation-controls"><button type="button" class="menu-toggle" aria-label="Open navigation" @click="$emit('menu')"><span /><span /></button><button type="button" class="playback-toggle" :aria-label="paused ? (mediaAvailable ? 'Resume video and motion' : 'Resume decorative motion') : (mediaAvailable ? 'Pause video and motion' : 'Pause decorative motion')" :aria-pressed="paused" @click="$emit('pause')"><span aria-hidden="true">{{ paused ? '▶' : 'Ⅱ' }}</span></button></div>
</template>
