<script setup lang="ts">
withDefaults(defineProps<{ title: string; detail: string; tone?: 'info' | 'warning' | 'error' }>(), { tone: 'info' })
</script>

<template>
  <div class="status-message" :class="`status-message--${tone}`" role="status">
    <strong>{{ title }}</strong>
    <p>{{ detail }}</p>
  </div>
</template>
