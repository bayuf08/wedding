<script setup lang="ts">
import { computed } from 'vue'
const props = withDefaults(defineProps<{
  id: string; number: string; label: string; modelValue?: string | number
  type?: 'text' | 'number' | 'textarea' | 'email' | 'password'; placeholder?: string; readonly?: boolean
  required?: boolean; disabled?: boolean; error?: string; help?: string; detail?: string
  autocomplete?: string; min?: string; max?: string; step?: string; inputmode?: 'decimal' | 'text'
}>(), { type: 'text' })
const emit = defineEmits<{ 'update:modelValue': [value: string]; activate: [label: string] }>()
const describedBy = computed(() => [props.error && `${props.id}-error`, props.help && `${props.id}-help`].filter(Boolean).join(' ') || undefined)
const filled = computed(() => String(props.modelValue ?? '').length > 0)
function update(event: Event) { emit('update:modelValue', (event.target as HTMLInputElement | HTMLTextAreaElement).value) }
</script>
<template>
  <div class="invitation-field form-field" :class="{ 'is-filled': filled, 'is-invalid': error }" :data-field-label="label" @focusin="emit('activate', label)">
    <label class="invitation-label" :for="id"><span class="field-number" aria-hidden="true">{{ number }}</span><span>{{ label }}</span><span v-if="detail || required" class="field-detail">{{ detail || 'Required' }}</span></label>
    <component :is="type === 'textarea' ? 'textarea' : 'input'" :id="id" :value="modelValue" :type="type === 'textarea' ? undefined : type" :placeholder="placeholder" :readonly="readonly" :aria-readonly="readonly || undefined" :required="required" :disabled="disabled" :autocomplete="autocomplete" :min="min" :max="max" :step="step" :inputmode="inputmode" :aria-invalid="Boolean(error)" :aria-describedby="describedBy" @input="update" />
    <span class="field-rule" aria-hidden="true" />
    <p v-if="help" :id="`${id}-help`" class="field-help">{{ help }}</p>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">{{ error }}</p>
  </div>
</template>
