// @vitest-environment happy-dom
import { mount, flushPromises } from '@vue/test-utils'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import NavigationDialog from '../../app/components/invitation/overlays/NavigationDialog.vue'
import { mediaManifest } from '../../app/data/media.manifest'

type PendingAnimation = { finish: () => void; cancel: ReturnType<typeof vi.fn>; frames: Keyframe[] }
let animations: PendingAnimation[] = []
let listeners: (() => void)[] = []
let preference = { matches: false, addEventListener: (_: string, fn: () => void) => listeners.push(fn), removeEventListener: vi.fn() }
let originals: { animate?: PropertyDescriptor; show?: PropertyDescriptor; close?: PropertyDescriptor }
beforeEach(() => {
  animations = []; listeners = []
  preference = { matches: false, addEventListener: (_: string, fn: () => void) => listeners.push(fn), removeEventListener: vi.fn() }
  vi.stubGlobal('matchMedia', () => preference)
  originals = { animate: Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'animate'), show: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'showModal'), close: Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, 'close') }
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute('open', '') } })
  Object.defineProperty(HTMLDialogElement.prototype, 'close', { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute('open'); this.dispatchEvent(new Event('close')) } })
  Object.defineProperty(HTMLElement.prototype, 'animate', { configurable: true, value: (frames: Keyframe[]) => {
    let finish!: () => void, reject!: (reason?: unknown) => void
    const finished = new Promise<void>((resolve, fail) => { finish = resolve; reject = fail })
    const cancel = vi.fn(() => reject(new Error('cancelled')))
    animations.push({ finish, cancel, frames }); return { finished, cancel }
  } })
})
afterEach(() => {
  for (const [key, prototype, name] of [['animate', HTMLElement.prototype, 'animate'], ['show', HTMLDialogElement.prototype, 'showModal'], ['close', HTMLDialogElement.prototype, 'close']] as const) {
    const descriptor = originals[key]
    if (descriptor) Object.defineProperty(prototype, name, descriptor)
    else Reflect.deleteProperty(prototype, name)
  }
  document.body.innerHTML = ''; vi.unstubAllGlobals()
})
const image = mediaManifest.navigation || mediaManifest.mountain!
async function finishAll() { animations.forEach(animation => animation.finish()); await flushPromises() }
describe('interruptible native navigation lifecycle', () => {
  it('wraps keyboard focus at both menu edges instead of entering browser chrome', async () => {
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image, motionEnabled: false } })
    await flushPromises()
    const first = wrapper.get<HTMLButtonElement>('[data-menu-toggle]'), last = wrapper.findAll<HTMLButtonElement>('nav button').at(-1)!
    first.element.focus()
    await first.trigger('keydown', { key: 'Tab', shiftKey: true })
    expect(document.activeElement).toBe(last.element)
    await last.trigger('keydown', { key: 'Tab' })
    expect(document.activeElement).toBe(first.element)
    wrapper.unmount()
  })
  it('keeps zero-scale curtain interpolation continuous instead of a singular matrix jump', async () => {
    const original = getComputedStyle
    vi.stubGlobal('getComputedStyle', (element: Element) => element.hasAttribute('data-menu-curtain') ? { transform: 'matrix(1, 0, 0, 0, 0, 844)', opacity: '1' } : original(element))
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image } })
    await flushPromises()
    expect(animations[0]?.frames[0]?.transform).toBe('translateY(844px) scaleY(0)')
    expect(animations[0]?.frames[1]?.transform).toBe('translateY(0) scaleY(1)')
    wrapper.unmount()
  })
  it('invalidates stale completion and restores focus only after final dismissal', async () => {
    const trigger = document.createElement('button'); document.body.append(trigger); trigger.focus()
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: false, image } })
    await wrapper.setProps({ open: true }); await flushPromises()
    expect(wrapper.attributes('data-phase')).toBe('opening')
    await wrapper.get('[data-menu-toggle]').trigger('click'); await flushPromises()
    expect(wrapper.attributes('data-phase')).toBe('closing')
    expect(wrapper.get<HTMLDialogElement>('dialog').element.open).toBe(true)
    await wrapper.get('[data-menu-toggle]').trigger('click'); await flushPromises(); await finishAll()
    expect(wrapper.attributes('data-phase')).toBe('open')
    expect(wrapper.emitted('close')).toBeUndefined()
    await wrapper.trigger('cancel'); await flushPromises(); await finishAll()
    expect(wrapper.attributes('data-phase')).toBe('closed')
    expect(wrapper.emitted('close')).toHaveLength(1)
    expect(document.activeElement).toBe(trigger)
    wrapper.unmount()
  })
  it('dispatches only the latest section after exit, without a duplicate dismissal', async () => {
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image } })
    await flushPromises()
    await wrapper.get('nav button').trigger('click'); await flushPromises()
    await wrapper.findAll('nav button').at(-1)!.trigger('click'); await flushPromises()
    expect(wrapper.emitted('navigate')).toBeUndefined()
    await finishAll()
    expect(wrapper.emitted('navigate')).toEqual([['gallery']])
    expect(wrapper.emitted('close')).toBeUndefined()
    wrapper.unmount()
  })
  it('settles immediately when reduced motion changes and cleans listeners/animations', async () => {
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image } })
    await flushPromises(); expect(animations.length).toBeGreaterThan(10)
    preference.matches = true; listeners.forEach(listener => listener()); await flushPromises()
    expect(wrapper.attributes('data-phase')).toBe('open')
    expect(animations.every(animation => animation.cancel.mock.calls.length)).toBe(true)
    await wrapper.trigger('cancel'); await flushPromises()
    expect(wrapper.attributes('data-phase')).toBe('closed')
    wrapper.unmount(); expect(preference.removeEventListener).toHaveBeenCalled()
  })
  it('uses an immediate accessible fallback with manual motion paused or no Web Animations', async () => {
    Reflect.deleteProperty(HTMLElement.prototype, 'animate')
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image, motionEnabled: false } })
    await flushPromises()
    expect(wrapper.attributes('data-phase')).toBe('open')
    expect(wrapper.get<HTMLDialogElement>('dialog').element.open).toBe(true)
    expect(animations).toHaveLength(0)
    await wrapper.setProps({ open: false }); await flushPromises()
    expect(wrapper.get<HTMLDialogElement>('dialog').element.open).toBe(false)
    wrapper.unmount()
  })
  it('cancels an in-flight menu on unmount without a delayed navigation event', async () => {
    const wrapper = mount(NavigationDialog, { attachTo: document.body, props: { open: true, image } })
    await flushPromises(); wrapper.unmount(); await finishAll()
    expect(animations.every(animation => animation.cancel.mock.calls.length)).toBe(true)
    expect(wrapper.emitted('navigate')).toBeUndefined()
    expect(wrapper.emitted('presence')?.at(-1)).toEqual([false])
  })
})
