// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { flushPromises } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CalendarAction from '../../app/components/invitation/shared/CalendarAction.vue'
import invitation from '../../app/assets/data/invitation.json'
const event = invitation.content.celebration.calendar
afterEach(() => vi.restoreAllMocks())

describe('calendar handoff', () => {
  it('uses one gesture-driven Android intent and offers a manual fallback without a second launch', async () => {
    vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue('Mozilla Android 15 Chrome/130')
    const write = vi.fn().mockResolvedValue(undefined)
    vi.spyOn(navigator.clipboard, 'writeText').mockImplementation(write)
    const wrapper = mount(CalendarAction, { props: { event } })
    await flushPromises()
    expect(wrapper.get('a').attributes('href')).toMatch(/^intent:\/\//)
    expect(wrapper.get('a').attributes('target')).toBe('_self')
    expect(wrapper.findAll('a')).toHaveLength(1)
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(write).toHaveBeenCalledTimes(1)
    expect(wrapper.get('[role="status"]').text()).toBe('Link copied.')
    write.mockRejectedValueOnce(new Error('denied'))
    await wrapper.get('button').trigger('click')
    await flushPromises()
    expect(wrapper.get('input').attributes('readonly')).toBeDefined()
    expect(wrapper.text()).not.toContain('Link copied.')
    wrapper.unmount()
  })
  it('retains web navigation on desktop and iOS and handles unavailable events', async () => {
    for (const userAgent of ['Desktop Chrome', 'iPhone Safari']) {
      vi.spyOn(navigator, 'userAgent', 'get').mockReturnValue(userAgent)
      const wrapper = mount(CalendarAction, { props: { event } })
      await flushPromises()
      expect(wrapper.get('a').attributes('href')).toMatch(/^https:\/\/calendar.google.com/)
      expect(wrapper.get('a').attributes('target')).toBe('_blank')
      expect(wrapper.find('details').exists()).toBe(false)
      await wrapper.setProps({ event: null })
      expect(wrapper.find('a').exists()).toBe(false)
      expect(wrapper.get('[role="status"]').text()).toContain('not available')
      wrapper.unmount()
    }
  })
})
