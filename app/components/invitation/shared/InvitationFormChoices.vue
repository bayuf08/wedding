<script setup lang="ts">
defineProps<{ id: string; number: string; label: string; name: string; modelValue?: string | number; options: { value: string | number; label: string }[]; required?: boolean; error?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: string | number]; activate: [label: string] }>()
</script>
<template>
  <fieldset class="invitation-field form-choice-field" :class="{ 'is-invalid': error }" :data-field-label="label" :aria-describedby="error ? `${id}-error` : undefined" @focusin="emit('activate', label)">
    <legend class="invitation-label"><span class="field-number" aria-hidden="true">{{ number }}</span><span>{{ label }}</span><span v-if="required" class="field-detail">Required</span></legend>
    <div class="form-choices">
      <label v-for="(option, index) in options" :key="option.value" class="form-choice">
        <input :id="index === 0 ? id : `${id}-${index}`" type="radio" :name="name" :value="option.value" :checked="modelValue === option.value" :required="required" :aria-invalid="Boolean(error)" :aria-describedby="error ? `${id}-error` : undefined" @change="emit('update:modelValue', option.value)">
        <span><i class="choice-check" aria-hidden="true">✓</i>{{ option.label }}</span>
      </label>
    </div>
    <p v-if="error" :id="`${id}-error`" class="field-error" role="alert">{{ error }}</p>
  </fieldset>
</template>
