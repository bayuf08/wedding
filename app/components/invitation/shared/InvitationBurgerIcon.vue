<script setup lang="ts">
withDefaults(defineProps<{ open?: boolean; animated?: boolean }>(), { open: false, animated: true })
</script>
<template>
  <span class="burger-lines" :class="{ 'is-open': open, 'is-static': !animated }" aria-hidden="true"><i /><i /></span>
</template>
<style scoped>
.burger-lines { position: relative; display: block; flex: none; width: var(--burger-width, 40px); height: var(--burger-height, 11px); }
.burger-lines i { position: absolute; left: 0; width: 100%; height: var(--burger-stroke, 2px); background: currentColor; transform-origin: center; transition: transform 300ms cubic-bezier(.19,1,.22,1); }
.burger-lines i:first-child { top: 0; }
.burger-lines i:last-child { bottom: 0; }
.burger-lines.is-open i:first-child { transform: translateY(calc((var(--burger-height, 11px) - var(--burger-stroke, 2px)) / 2)) rotate(45deg); }
.burger-lines.is-open i:last-child { transform: translateY(calc((var(--burger-height, 11px) - var(--burger-stroke, 2px)) / -2)) rotate(-45deg); }
.burger-lines.is-static i { transition: none; }
@media (prefers-reduced-motion: reduce) { .burger-lines i { transition: none; } }
</style>
