<script setup lang="ts">
withDefaults(defineProps<{ label: string; busy?: boolean; busyLabel?: string; disabled?: boolean }>(), { busyLabel: 'Checking…' })
</script>
<template>
  <button type="submit" class="form-submit" :disabled="busy || disabled">
    <i v-for="corner in ['tl', 'tr', 'bl', 'br']" :key="corner" class="action-corner" :class="`action-corner--${corner}`" aria-hidden="true" />
    <span class="action-label">{{ busy ? busyLabel : label }}</span>
  </button>
</template>
