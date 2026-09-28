<script setup lang="ts">
withDefaults(defineProps<{ href: string; variant?: 'primary' | 'secondary' | 'quiet'; external?: boolean }>(), {
  variant: 'primary',
  external: false,
})
</script>

<template>
  <a
    :href="href"
    class="base-action"
    :class="`base-action--${variant}`"
    :target="external ? '_blank' : undefined"
    :rel="external ? 'noreferrer' : undefined"
  ><slot /></a>
</template>
