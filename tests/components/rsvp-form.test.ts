// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import RsvpSection from '../../app/components/invitation/scenes/RsvpSection.vue'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'
import { createWeddingRsvpDraft, normalizeRsvpSubmission, validateRsvpDraft } from '../../app/utils/rsvp'

afterEach(() => vi.useRealTimers())
describe('simplified wedding attendance contract', () => {
  it('defaults attending without silently supplying a guest count', () => {
    const draft = createWeddingRsvpDraft('matrimony')
    expect(draft).toEqual({ attendance: 'ATTENDING', eventId: 'matrimony' })
    expect(validateRsvpDraft(draft)).toEqual({ attendanceCount: 'attending_count_required' })
    expect(normalizeRsvpSubmission({ ...draft, attendance: 'NOT_ATTENDING', attendanceCount: 2, note: 'Message' })).toEqual({ attendance: 'NOT_ATTENDING', note: 'Message' })
  })
  it('offers only one attendee when the invitation maximum is one', () => {
    const wrapper = mount(RsvpSection, { props: { rsvp: invitationFixture.content.rsvp, image: mediaManifest.mountain!, guestName: 'Synthetic Guest', eventId: 'matrimony', guestLimit: 1 } })
    expect(wrapper.findAll('input[name=attendance-count]')).toHaveLength(1)
    expect(wrapper.get<HTMLInputElement>('#rsvp-attendanceCount').element.value).toBe('1')
    expect(wrapper.get<HTMLInputElement>('#rsvp-attendanceCount').element.checked).toBe(false)
    wrapper.unmount()
  })
  it('preserves chosen count across toggles and emits no stale count for nonattendance', async () => {
    vi.useFakeTimers()
    const wrapper = mount(RsvpSection, { props: { rsvp: invitationFixture.content.rsvp, image: mediaManifest.mountain!, guestName: 'Guest', eventId: 'matrimony' } })
    expect(wrapper.get<HTMLInputElement>('#rsvp-attendance').element.checked).toBe(true)
    expect(wrapper.findAll('input[name=attendance-count]')).toHaveLength(2)
    expect(wrapper.findAll('input[name=attendance-count]:checked')).toHaveLength(0)
    expect(wrapper.find('#rsvp-eventId').exists()).toBe(false)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.find('#rsvp-attendanceCount-error').exists()).toBe(true)
    await wrapper.get('#rsvp-attendanceCount-1').setValue(true)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('previewSubmit')?.[0]).toEqual([{ attendance: 'ATTENDING', eventId: 'matrimony', attendanceCount: 2 }])
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('previewSubmit')).toHaveLength(1)
    await vi.advanceTimersByTimeAsync(240)
    await wrapper.get('#rsvp-attendance-1').setValue(true)
    expect(wrapper.find('#rsvp-attendanceCount').exists()).toBe(false)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('previewSubmit')?.[1]).toEqual([{ attendance: 'NOT_ATTENDING', note: undefined }])
    await vi.advanceTimersByTimeAsync(240)
    await wrapper.get('#rsvp-attendance').setValue(true)
    expect(wrapper.get<HTMLInputElement>('#rsvp-attendanceCount-1').element.checked).toBe(true)
    wrapper.findAllComponents({ name: 'InvitationFormChoices' })[1]!.vm.$emit('update:modelValue', 1.5)
    await wrapper.get('form').trigger('submit')
    expect(wrapper.find('#rsvp-attendanceCount-error').exists()).toBe(true)
    expect(wrapper.emitted('previewSubmit')).toHaveLength(2)
    wrapper.unmount()
  })
})

describe('static content stays read-only during local form review', () => {
  it('does not append or persist a reviewed response into invitation JSON', async () => {
    vi.useFakeTimers()
    const before = JSON.stringify(invitationFixture)
    const wrapper = mount(RsvpSection, { props: { rsvp: invitationFixture.content.rsvp, image: mediaManifest.mountain!, guestName: 'Local Guest', eventId: 'matrimony' } })
    await wrapper.get('#rsvp-attendanceCount').setValue(true)
    await wrapper.get('form').trigger('submit')
    await vi.advanceTimersByTimeAsync(240)
    expect(wrapper.get('[role=status]').text()).toContain('Nothing has been sent or saved')
    expect(JSON.stringify(invitationFixture) === before).toBe(true)
    wrapper.unmount()
  })
})
