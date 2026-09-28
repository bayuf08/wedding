<script setup lang="ts">
defineProps<{ text: string; muted?: boolean }>()
</script>
<template>
  <div class="claire-ribbon" :class="{ 'claire-ribbon--muted': muted }">
    <span class="sr-only">{{ text }}</span>
    <div class="claire-ribbon-track" aria-hidden="true">
      <span class="claire-ribbon-half">* {{ text }} &nbsp; * {{ text }} &nbsp; </span>
      <span class="claire-ribbon-half">* {{ text }} &nbsp; * {{ text }} &nbsp; </span>
    </div>
  </div>
</template>
