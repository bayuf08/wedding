<script setup lang="ts">
import { ref } from 'vue'
import ResponsivePhoto from '../../ui/ResponsivePhoto.vue'
import type { ClaireContent, ImageAsset } from '../../../types/claire'
defineProps<{ gift: ClaireContent['gift']; image: ImageAsset }>()
defineEmits<{ open: [] }>()
const copyStatus = ref('')
async function copy(account: string) {
  try {
    await navigator.clipboard.writeText(account)
    copyStatus.value = 'Copied'
  } catch {
    copyStatus.value = 'Select the account number to copy it.'
  }
}
</script>
<template>
  <section id="gift" class="gift-introduction" tabindex="-1" aria-labelledby="gift-title">
    <div class="scene-container gift-layout">
      <div>
        <h2 id="gift-title" class="gift-copy claire-body motion-entry" data-entry="heading">{{ gift.introduction }}</h2>
        <div class="gift-accounts">
          <h3 class="gift-accounts-title">Bank Account</h3>
          <div class="bank-list">
            <div v-for="bank in gift.banks" :key="bank.id" class="bank-row">
              <div>
                <strong>{{ bank.holder }}</strong>
                <small>{{ bank.bank }}</small>
                <span class="bank-number">{{ bank.account }}</span>
              </div>
              <button type="button" :aria-label="`Copy ${bank.bank} account number`" @click="copy(bank.account)">Copy</button>
            </div>
          </div>
          <p role="status">{{ copyStatus }}</p>
          <button type="button" class="text-action" @click="$emit('open')">Confirm Gift</button>
        </div>
      </div>
      <div class="gift-image"><ResponsivePhoto :asset="image" sizes="(max-width: 767px) 100vw, 539px" /></div>
    </div>
  </section>
</template>

<style scoped>
.gift-accounts-title { margin: 0 0 20px; font-size: 24px; font-weight: 400; }
.bank-row { gap: 16px; }
.bank-row > div { min-width: 0; overflow-wrap: anywhere; }
.bank-row button { flex-shrink: 0; min-width: 44px; min-height: 44px; }
</style>
