<script setup lang="ts">
import type { ChapterRecord } from '../../../types/claire'
defineProps<{ chapters: [ChapterRecord, ChapterRecord, ChapterRecord] }>()
</script>
<template>
  <section class="story-chapters" aria-label="Our love story">
    <div class="scene-container">
      <article v-for="chapter in chapters" :key="chapter.id" class="story-chapter">
        <h3 class="story-chapter-heading claire-serif motion-entry"><span>{{ chapter.year }}</span><br>/ {{ chapter.title }}</h3>
        <div class="story-chapter-body claire-body motion-entry"><p v-for="(paragraph, index) in chapter.paragraphs" :key="index">{{ paragraph }}</p></div>
      </article>
    </div>
  </section>
</template>
