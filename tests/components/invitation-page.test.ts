// @vitest-environment happy-dom
import { enableAutoUnmount, mount } from '@vue/test-utils'
import { afterEach, describe, expect, it } from 'vitest'
import InvitationExperience from '../../app/components/invitation/InvitationExperience.vue'
import InvitationUnavailable from '../../app/components/invitation/InvitationUnavailable.vue'
import ProtectedInvitationShell from '../../app/components/invitation/ProtectedInvitationShell.vue'
import ResponsivePhoto from '../../app/components/ui/ResponsivePhoto.vue'
import { invitationFixture } from '../../app/data/invitation.fixture'
import { mediaManifest } from '../../app/data/media.manifest'

enableAutoUnmount(afterEach)

describe('Claire invitation composition', () => {
  it('layers matching responsive hero images around the moving names', () => {
    const wrapper = mount(InvitationExperience, { props: { invitation: invitationFixture } })
    const hero = wrapper.get('.opened-hero')
    const base = hero.get('.hero-media--base')
    const foreground = hero.get('.hero-media--foreground')
    const marquee = hero.get('.hero-marquee')
    const mobileSource = 'source[media="(max-width: 767px), (max-width: 1023px) and (orientation: portrait)"]'

    expect(base.get('img').attributes('src')).toBe('/images/kv.png')
    expect(base.get(mobileSource).attributes('srcset')).toBe('/images/kv-mobile.png')
    expect(base.get(mobileSource).attributes('width')).toBe('941')
    expect(base.get(mobileSource).attributes('height')).toBe('1672')
    expect(foreground.get('img').attributes('src')).toBe('/images/kv-transparent.png')
    expect(foreground.get(mobileSource).attributes('srcset')).toBe('/images/kv-mobile-transparent.png')
    expect(foreground.get(mobileSource).attributes('width')).toBe('941')
    expect(foreground.get(mobileSource).attributes('height')).toBe('1672')
    expect(base.element.compareDocumentPosition(marquee.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(marquee.element.compareDocumentPosition(foreground.element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })

  it('reveals the foreground and marquee only after both hero layers are ready', async () => {
    const wrapper = mount(InvitationExperience, { props: { invitation: invitationFixture } })
    const marquee = wrapper.get('.hero-marquee')
    const foreground = wrapper.get('.hero-media--foreground')
    expect(marquee.classes()).toContain('hero-marquee--waiting')
    expect(foreground.classes()).toContain('hero-media--waiting')

    await foreground.get('img').trigger('load')
    expect(marquee.classes()).toContain('hero-marquee--waiting')
    await wrapper.get('.hero-media--base img').trigger('load')
    expect(foreground.classes()).toContain('hero-media--ready')
    expect(marquee.classes()).toContain('hero-marquee--ready')
  })

  it('keeps the base visible and the marquee masked when the foreground fails', async () => {
    const wrapper = mount(InvitationExperience, { props: { invitation: invitationFixture } })
    await wrapper.get('.hero-media--base img').trigger('load')
    await wrapper.get('.hero-media--foreground img').trigger('error')

    expect(wrapper.find('.hero-media--foreground').exists()).toBe(false)
    expect(wrapper.get('.hero-media--base img').attributes('src')).toBe('/images/kv.png')
    expect(wrapper.get('.hero-marquee').classes()).toContain('hero-marquee--waiting')
  })

  it('has one logical heading and all planned scenes in order', () => {
    const wrapper = mount(InvitationExperience, { props: { invitation: invitationFixture, guestName: 'Guest Name' } })
    expect(wrapper.findAll('h1')).toHaveLength(1)
    expect(wrapper.findAll('main > section').length).toBeGreaterThan(8)
    const ids = wrapper.findAll('main > section[id]').map(section => section.attributes('id'))
    expect(ids).toEqual(['welcome', 'profile', 'story', 'details', 'gift', 'rsvp', 'gallery'])
    expect(wrapper.text()).toContain('Hilwa Qurrotul Aina')
    expect(wrapper.text()).toContain('With a smile that lit up her face, Hilwa said yes.')
    expect(wrapper.text()).toContain('@bayufajar.design')
    expect(wrapper.text()).toContain('@_hiqurai')
  })

  it('keeps fixture content out of protected and unavailable output', () => {
    const address = invitationFixture.content.events.rows[0]!.lines[1]!
    for (const wrapper of [mount(ProtectedInvitationShell), mount(InvitationUnavailable, { props: { state: 'UNAVAILABLE' } })]) {
      expect(wrapper.text()).not.toContain(invitationFixture.couple.firstName)
      expect(wrapper.text()).not.toContain(address)
    }
  })

  it('shows a lifecycle notice when the event is postponed', () => {
    const wrapper = mount(InvitationExperience, { props: { invitation: { ...invitationFixture, lifecycle: 'POSTPONED' } } })
    expect(wrapper.get('[role="status"]').text()).toContain('postponed')
  })
})

describe('ResponsivePhoto', () => {
  it('uses the mobile hero source on phone-sized screens', () => {
    const wrapper = mount(ResponsivePhoto, { props: { asset: mediaManifest['hero-kv']! } })
    expect(wrapper.get('source[media="(max-width: 767px)"]').attributes('srcset')).toBe('/images/kv-mobile.png')
  })

  it('reserves actual dimensions and recovers when the source changes', async () => {
    const wrapper = mount(ResponsivePhoto, { props: { asset: mediaManifest.cover! } })
    expect(wrapper.get('img').attributes('width')).toBe('858')
    expect(wrapper.get('img').attributes('height')).toBe('1280')
    await wrapper.get('img').trigger('error')
    expect(wrapper.get('[role="img"]').text()).toContain('Image unavailable')
    await wrapper.setProps({ asset: mediaManifest['gallery-02']! })
    expect(wrapper.get('img').attributes('src')).toContain('00155.jpg')
  })
})
