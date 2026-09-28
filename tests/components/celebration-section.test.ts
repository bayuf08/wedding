// @vitest-environment happy-dom
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import CelebrationSection from '../../app/components/invitation/scenes/CelebrationSection.vue'
import { mediaManifest } from '../../app/data/media.manifest'

afterEach(() => vi.useRealTimers())

describe('CelebrationSection', () => {
  it('counts down to the 26 December 2026 Akad Nikah start time', async () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-12-25T01:00:00Z'))

    const wrapper = mount(CelebrationSection, {
      props: {
        celebration: {
          imageId: 'celebration',
          ribbon: '/ Almost Time For Our Celebration',
          calendar: {
            uid: 'bayu-hilwa-wedding',
            title: 'Akad Nikah Bayu & Hilwa',
            startsAt: '2026-12-26T08:00:00+07:00',
            endsAt: '2026-12-26T10:00:00+07:00',
            location: 'Jakarta, Indonesia',
          },
        },
        image: mediaManifest.celebration!,
      },
    })

    await nextTick()
    expect(wrapper.get('.countdown').text()).toBe('01D00H00M00S')
  })
})
