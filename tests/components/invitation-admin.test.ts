// @vitest-environment happy-dom
import { flushPromises, mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import InvitationWorkspace from '../../app/components/admin/InvitationWorkspace.vue'
import InvitationAdminLogin from '../../app/components/admin/InvitationAdminLogin.vue'
import type { InvitationAdminGateway } from '../../app/types/invitation-admin'
vi.mock('../../app/utils/invitation-import', async importOriginal => ({ ...await importOriginal<object>(), readWorkbookFile: vi.fn(async () => ({ headers: ['name', 'externalId', 'maxAttendees'], rows: [{ rowNumber: 2, cells: ['Local Guest', 'local-guest', 2], errors: [] }, { rowNumber: 3, cells: ['', 'invalid-row', 2], errors: [] }] })) }))
describe('private invitation workspace', () => {
  it('does not pretend unconnected storage can save or show guests', async () => {
    const wrapper = mount(InvitationWorkspace)
    await flushPromises()
    expect(wrapper.text()).toContain('Guest storage is not connected')
    expect(wrapper.get('button[type=submit]').attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('.admin-guest-row')).toHaveLength(0)
  })
  it('validates manual entry, escapes names and retains the same key after an uncertain result', async () => {
    const create = vi.fn<InvitationAdminGateway['create']>().mockRejectedValueOnce(new Error('Offline')).mockImplementationOnce(async rows => [{ clientRowId: rows[0]!.clientRowId, status: 'created', guest: { id: 'new', name: 'Local Guest', shortcode: 'local-guest', guestLimit: 2, enabled: true } }])
    const gateway: InvitationAdminGateway = { list: vi.fn(async () => [{ id: 'a', name: '<script>text</script>', shortcode: 'existing', guestLimit: 2, enabled: true }]), create }
    const wrapper = mount(InvitationWorkspace, { props: { gateway } })
    await flushPromises()
    expect(wrapper.find('script').exists()).toBe(false)
    await wrapper.get('form').trigger('submit')
    expect(create).not.toHaveBeenCalled()
    await wrapper.get('#admin-name').setValue('Local Guest')
    await wrapper.get('#admin-code').setValue('local-guest')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(wrapper.text()).toContain('result is not confirmed')
    await wrapper.get('form').trigger('submit'); await flushPromises()
    expect(create.mock.calls[0]?.[1]).toBe(create.mock.calls[1]?.[1])
    expect(wrapper.text()).toContain('Invitation confirmed by the server')
  })
  it('requires explicit import confirmation, excludes invalid rows and retries the same unresolved key', async () => {
    const create = vi.fn<InvitationAdminGateway['create']>().mockRejectedValue(new Error('Uncertain'))
    const wrapper = mount(InvitationWorkspace, { props: { gateway: { list: async () => [], create } } })
    await flushPromises()
    await wrapper.findAll('.admin-mode button')[1]!.trigger('click')
    const input = wrapper.get('#admin-workbook')
    Object.defineProperty(input.element, 'files', { value: [new File(['synthetic'], 'local.xlsx')] })
    await input.trigger('change'); await flushPromises()
    expect(wrapper.text()).toContain('1 eligible · 1 need correction')
    expect(wrapper.get('.admin-primary').attributes('disabled')).toBeDefined()
    await wrapper.get('input[type=checkbox]').setValue(true)
    await wrapper.get('.admin-primary').trigger('click'); await flushPromises()
    await wrapper.get('.admin-primary').trigger('click'); await flushPromises()
    expect(create).toHaveBeenCalledTimes(2)
    expect(create.mock.calls[0]?.[0]).toHaveLength(1)
    expect(create.mock.calls[0]?.[1]).toBe(create.mock.calls[1]?.[1])
    expect(create.mock.calls[0]?.[0][0]?.clientRowId).toBe(create.mock.calls[1]?.[0][0]?.clientRowId)
  })
  it('keeps passwords only in the transient login form and clears them after handing off', async () => {
    const wrapper = mount(InvitationAdminLogin, { props: { busy: false, available: true, message: '' } })
    await wrapper.get('#admin-email').setValue('admin@example.test')
    await wrapper.get('#admin-password').setValue('synthetic-not-a-real-password')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.emitted('login')).toHaveLength(1)
    expect(wrapper.get<HTMLInputElement>('#admin-password').element.value).toBe('')
    expect(wrapper.get('#admin-password').attributes('type')).toBe('password')
  })
})
