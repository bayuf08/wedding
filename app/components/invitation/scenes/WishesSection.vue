<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WishRecord } from '../../../types/claire'
const props = defineProps<{ wishes: WishRecord[]; pageSize: number }>()
const page = ref(1)
const pages = computed(() => Math.max(1, Math.ceil(props.wishes.length / props.pageSize)))
const visible = computed(() => props.wishes.slice((page.value - 1) * props.pageSize, page.value * props.pageSize))
function changePage(value: number) { page.value = Math.max(1, Math.min(pages.value, value)); document.getElementById('wishes-title')?.scrollIntoView({ block: 'start' }) }
</script>
<template>
  <section class="wishes-section" aria-labelledby="wishes-title"><div class="scene-container"><h2 id="wishes-title" class="sr-only">Guest wishes</h2><p class="sr-only" role="status">Page {{ page }} of {{ pages }}</p>
    <div class="wishes-list"><article v-for="wish in visible" :key="wish.id" class="wish-row"><span class="wish-avatar" aria-hidden="true">{{ wish.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase() }}</span><div><div class="wish-meta"><strong>{{ wish.name }}</strong><time>{{ wish.dateLabel }}</time></div><p>{{ wish.message }}</p></div></article></div>
    <nav class="wish-pages" aria-label="Wishes pages"><button v-if="page > 1" type="button" @click="changePage(page - 1)">« Previous</button><button v-for="number in pages" :key="number" type="button" :aria-current="page === number ? 'page' : undefined" @click="changePage(number)">{{ number }}</button><button v-if="page < pages" type="button" @click="changePage(page + 1)">Next »</button></nav>
  </div></section>
</template>
