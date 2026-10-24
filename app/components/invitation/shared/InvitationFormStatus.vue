<script setup lang="ts">
defineProps<{ message: string }>()
</script>
<template><p class="form-status" role="status" aria-live="polite">{{ message }}</p></template>
