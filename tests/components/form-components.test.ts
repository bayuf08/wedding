// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import InvitationFormField from '../../app/components/invitation/shared/InvitationFormField.vue'
import InvitationFormChoices from '../../app/components/invitation/shared/InvitationFormChoices.vue'
import InvitationFormAction from '../../app/components/invitation/shared/InvitationFormAction.vue'
import InvitationFormStatus from '../../app/components/invitation/shared/InvitationFormStatus.vue'

describe('shared wedding form primitives', () => {
  it('associates label, help and validation and emits unmodified field values', async () => {
    const field = mount(InvitationFormField, { props: { id: 'sample', number: '01', label: 'Name', error: 'Enter your name.', help: 'Use your invitation name.' } })
    expect(field.get('label').attributes('for')).toBe('sample')
    expect(field.get('input').attributes('aria-describedby')).toBe('sample-error sample-help')
    expect(field.get('input').attributes('aria-invalid')).toBe('true')
    expect(field.get('[role=alert]').text()).toBe('Enter your name.')
    await field.get('input').setValue('  Example  ')
    expect(field.emitted('update:modelValue')?.[0]).toEqual(['  Example  '])
    await field.setProps({ modelValue: 'Example', error: undefined })
    expect(field.classes()).toContain('is-filled')
    expect(field.get('input').attributes('aria-describedby')).toBe('sample-help')
  })
  it('preserves textarea, readonly and numeric native attributes', () => {
    const name = mount(InvitationFormField, { props: { id: 'name', number: '01', label: 'Name', readonly: true, modelValue: 'Guest' } })
    expect(name.get('input').attributes('readonly')).toBeDefined()
    const note = mount(InvitationFormField, { props: { id: 'note', number: '02', label: 'Note', type: 'textarea' } })
    expect(note.find('textarea').exists()).toBe(true)
    const amount = mount(InvitationFormField, { props: { id: 'amount', number: '03', label: 'Amount', type: 'number', min: '0.01', step: '0.01', inputmode: 'decimal' } })
    expect(amount.get('input').attributes()).toMatchObject({ type: 'number', min: '0.01', step: '0.01', inputmode: 'decimal' })
  })
  it('uses native radio values and group error relationships', async () => {
    const choices = mount(InvitationFormChoices, { props: { id: 'guest-count', number: '03', name: 'guests', label: 'Guests', options: [{ value: 1, label: '1 guest' }, { value: 2, label: '2 guests' }], modelValue: 1, error: 'Choose guests.' } })
    const radios = choices.findAll('input')
    expect(radios[0]?.attributes('id')).toBe('guest-count')
    expect(radios[0]?.element.checked).toBe(true)
    expect(radios[1]?.attributes()).toMatchObject({ name: 'guests', type: 'radio', 'aria-describedby': 'guest-count-error' })
    await radios[1]?.setValue(true)
    expect(choices.emitted('update:modelValue')?.[0]).toEqual([2])
    expect(choices.find('.choice-check').attributes('aria-hidden')).toBe('true')
  })
  it('locks a busy native submit and keeps status region mounted', async () => {
    const action = mount(InvitationFormAction, { props: { label: 'Confirm', busy: true } })
    expect(action.get('button').attributes('type')).toBe('submit')
    expect(action.get('button').attributes('disabled')).toBeDefined()
    expect(action.text()).toBe('Checking…')
    expect(action.findAll('.action-corner')).toHaveLength(4)
    await action.setProps({ busy: false })
    expect(action.get('button').attributes('disabled')).toBeUndefined()
    const status = mount(InvitationFormStatus, { props: { message: '' } })
    expect(status.get('[role=status]').text()).toBe('')
    await status.setProps({ message: 'Saved for preview.' })
    expect(status.get('[role=status]').text()).toBe('Saved for preview.')
  })
})
