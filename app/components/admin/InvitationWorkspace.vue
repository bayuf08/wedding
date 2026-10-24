<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import InvitationFormField from '../invitation/shared/InvitationFormField.vue'
import InvitationFormAction from '../invitation/shared/InvitationFormAction.vue'
import InvitationFormStatus from '../invitation/shared/InvitationFormStatus.vue'
import type { ImportMapping, ImportPreviewRow, InvitationAdminGateway, InvitationCreateResult, InvitationGuest, WorkbookData } from '../../types/invitation-admin'
import { canonicalName, createInvitationTemplate, previewImport, readWorkbookFile, suggestMapping, validateGuestDraft } from '../../utils/invitation-import'
const props = defineProps<{ gateway?: InvitationAdminGateway }>()
const guests = ref<InvitationGuest[]>([])
const listState = ref<'loading' | 'ready' | 'error' | 'unavailable'>('loading')
const query = ref(''), tab = ref<'manual' | 'excel'>('manual')
const manual = reactive({ name: '', shortcode: '', limit: '2' })
const fieldErrors = reactive({ name: '', shortcode: '', limit: '' })
const manualStatus = ref(''), manualBusy = ref(false), uncertainManual = ref(false)
let manualAttempt: { id: string; row: { clientRowId: string; name: string; shortcode: string; guestLimit: number } } | undefined
const workbook = ref<WorkbookData>(), mapping = reactive<ImportMapping>({ name: -1, shortcode: null, guestLimit: null })
const preview = ref<ImportPreviewRow[]>([]), importError = ref(''), importStatus = ref(''), parsing = ref(false), importing = ref(false), confirmed = ref(false)
const operationId = ref('')
const results = ref<Record<string, InvitationCreateResult>>({})
const visible = computed(() => guests.value.filter(guest => canonicalName(guest.name).includes(canonicalName(query.value)) || guest.shortcode.includes(query.value.trim().toLowerCase())))
const mixedBatch = computed(() => Object.values(results.value).some(result => result.status === 'created') && Object.values(results.value).some(result => result.status === 'unknown' || result.retryable))
const eligible = computed(() => mixedBatch.value ? [] : preview.value.filter(row => !row.errors.length && (!results.value[row.clientRowId] || results.value[row.clientRowId]?.status === 'unknown' || results.value[row.clientRowId]?.retryable)))
const validCount = computed(() => preview.value.filter(row => !row.errors.length).length)
async function refresh() {
  if (!props.gateway) { listState.value = 'unavailable'; return }
  listState.value = 'loading'
  try { guests.value = await props.gateway.list(); listState.value = 'ready' } catch { listState.value = 'error' }
}
onMounted(refresh)
async function addGuest() {
  if (manualBusy.value || !props.gateway || listState.value !== 'ready') return
  fieldErrors.name = ''; fieldErrors.shortcode = ''; fieldErrors.limit = ''; manualStatus.value = ''
  if (!manualAttempt) {
    const id = crypto.randomUUID()
    const row = { clientRowId: id, name: manual.name.normalize('NFC').trim(), shortcode: manual.shortcode.trim().toLowerCase() || `inv-${id.replaceAll('-', '')}`, guestLimit: Number(manual.limit) }
    const errors = validateGuestDraft(row)
    fieldErrors.name = errors.find(error => error.startsWith('Name')) || ''
    fieldErrors.shortcode = errors.find(error => error.startsWith('Shortcode')) || ''
    fieldErrors.limit = errors.find(error => error.startsWith('Guest limit')) || ''
    if (guests.value.some(guest => canonicalName(guest.name) === canonicalName(row.name))) fieldErrors.name = 'This name already exists. Check the guest list before adding another invitation.'
    if (guests.value.some(guest => guest.shortcode === row.shortcode)) fieldErrors.shortcode = 'This shortcode already exists.'
    const first = fieldErrors.name ? 'admin-name' : fieldErrors.shortcode ? 'admin-code' : fieldErrors.limit ? 'admin-limit' : ''
    if (first) { await nextTick(); document.getElementById(first)?.focus(); return }
    manualAttempt = { id, row }
  }
  manualBusy.value = true
  try {
    const [result] = await props.gateway.create([manualAttempt.row], manualAttempt.id)
    if (result?.clientRowId === manualAttempt.row.clientRowId && result.status === 'created' && result.guest) {
      manualStatus.value = 'Invitation confirmed by the server.'
      manual.name = ''; manual.shortcode = ''; manual.limit = '2'; manualAttempt = undefined; uncertainManual.value = false
      await refresh()
    } else if (result?.status === 'rejected' || result?.status === 'duplicate') {
      manualStatus.value = result.message || 'The server rejected this invitation. Review its details.'
      manualAttempt = undefined; uncertainManual.value = false
    } else { uncertainManual.value = true; manualStatus.value = 'The result is not confirmed. Retry this same request before changing its details.' }
  } catch { uncertainManual.value = true; manualStatus.value = 'The result is not confirmed. Retry this same request before changing its details.' }
  finally { manualBusy.value = false }
}
async function chooseFile(event: Event) {
  const file = (event.target as HTMLInputElement).files?.[0]
  preview.value = []; results.value = {}; confirmed.value = false; workbook.value = undefined; importError.value = ''; importStatus.value = ''
  if (!file) return
  parsing.value = true
  try { workbook.value = await readWorkbookFile(file); Object.assign(mapping, suggestMapping(workbook.value.headers)); reviewMapping() }
  catch (error) { importError.value = error instanceof Error ? error.message : 'Unable to read workbook.' }
  finally { parsing.value = false }
}
function reviewMapping() {
  confirmed.value = false; results.value = {}; importStatus.value = ''; preview.value = []; importError.value = ''
  if (!workbook.value) return
  operationId.value = crypto.randomUUID()
  try {
    preview.value = previewImport(workbook.value, mapping, guests.value, operationId.value)
    for (const row of preview.value) if (!row.draft.shortcode) row.draft.shortcode = `inv-${operationId.value.replaceAll('-', '')}-${row.rowNumber}`
  } catch (error) { importError.value = error instanceof Error ? error.message : 'Review the mapped columns.' }
}
async function saveImport() {
  if (!confirmed.value || !eligible.value.length || importing.value || !props.gateway || listState.value !== 'ready') return
  importing.value = true; importStatus.value = ''
  const attempted = eligible.value.map(row => ({ ...row.draft, clientRowId: row.clientRowId }))
  try {
    const response = await props.gateway.create(attempted, operationId.value)
    for (const row of attempted) results.value[row.clientRowId] = response.find(result => result.clientRowId === row.clientRowId) || { clientRowId: row.clientRowId, status: 'unknown', retryable: true }
    importStatus.value = 'Review the result for every row. Only confirmed rows are marked created.'
    await refresh()
  } catch {
    for (const row of attempted) results.value[row.clientRowId] = { clientRowId: row.clientRowId, status: 'unknown', retryable: true }
    importStatus.value = 'The result is not confirmed. Retry unresolved rows with the same request key.'
  } finally { importing.value = false }
}
async function downloadTemplate() {
  importError.value = ''
  try {
    const bytes = await createInvitationTemplate(), url = URL.createObjectURL(new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }))
    const link = document.createElement('a'); link.href = url; link.download = 'wedding-invitations-template.xlsx'; link.click(); setTimeout(() => URL.revokeObjectURL(url), 1000)
  } catch { importError.value = 'Unable to create the template. Try again.' }
}
function copyLink(guest: InvitationGuest) {
  navigator.clipboard.writeText(new URL(`/invite/${encodeURIComponent(guest.linkToken || '')}`, location.origin).href).then(() => { manualStatus.value = 'Invitation link copied.' }).catch(() => { manualStatus.value = 'Select the invitation link to copy it.' })
}
</script>
<template>
  <div class="invitation-workspace">
    <div v-if="listState === 'unavailable'" class="admin-notice" role="status">Guest storage is not connected yet. You can prepare an Excel preview; nothing can be saved. Existing guest duplicates cannot be checked until the private list is available.</div>
    <nav class="admin-mode" aria-label="Invitation entry method"><button type="button" :aria-pressed="tab === 'manual'" @click="tab = 'manual'">Add a guest</button><button type="button" :aria-pressed="tab === 'excel'" @click="tab = 'excel'">Import Excel</button></nav>
    <section v-if="tab === 'manual'" aria-labelledby="manual-title" class="admin-editor">
      <div><h2 id="manual-title">One invitation at a time.</h2><p>Use the name you want your guest to see. A blank code proposes a random invitation code; the server must confirm it.</p></div>
      <form class="invitation-form invitation-form--light" novalidate @submit.prevent="addGuest">
        <fieldset :disabled="manualBusy || uncertainManual" class="admin-fields">
          <InvitationFormField id="admin-name" v-model="manual.name" number="01" label="Invitation name" required :error="fieldErrors.name" placeholder="Guest or family name" />
          <InvitationFormField id="admin-code" v-model="manual.shortcode" number="02" label="Reference Code" detail="Optional" :error="fieldErrors.shortcode" placeholder="Propose a code automatically" />
          <InvitationFormField id="admin-limit" v-model="manual.limit" number="03" label="Guest limit" type="number" min="1" max="2" step="1" help="Maximum allowed guests, not an attendance response." :error="fieldErrors.limit" />
        </fieldset>
        <InvitationFormAction :label="uncertainManual ? 'Retry same invitation' : 'Add invitation'" :busy="manualBusy" :disabled="!gateway || listState !== 'ready'" />
        <InvitationFormStatus :message="manualStatus" />
      </form>
    </section>
    <section v-else aria-labelledby="excel-title" class="admin-import">
      <div class="admin-section-heading"><div><h2 id="excel-title">Prepare your guest list.</h2><p>.xlsx only · up to 2 MiB · 200 guest rows. File selection never saves invitations.</p></div><button type="button" class="admin-text-button" @click="downloadTemplate">Download empty template</button></div>
      <label for="admin-workbook" class="admin-file-label">Choose Excel workbook</label><input id="admin-workbook" type="file" accept=".xlsx" :disabled="parsing || importing" @change="chooseFile">
      <p v-if="parsing" role="status">Reading and validating workbook…</p>
      <p v-if="importError" class="admin-error" role="alert">{{ importError }}</p>
      <div v-if="workbook" class="admin-mapping">
        <label>Name column<select v-model="mapping.name" :disabled="importing" @change="reviewMapping"><option :value="-1">Choose a column</option><option v-for="(header, index) in workbook.headers" :key="index" :value="index">{{ header }}</option></select></label>
        <label>Reference code column<select v-model="mapping.shortcode" :disabled="importing" @change="reviewMapping"><option :value="null">Generate proposed codes</option><option v-for="(header, index) in workbook.headers" :key="index" :value="index">{{ header }}</option></select></label>
        <label>Guest limit column<select v-model="mapping.guestLimit" :disabled="importing" @change="reviewMapping"><option :value="null">Use maximum 2</option><option v-for="(header, index) in workbook.headers" :key="index" :value="index">{{ header }}</option></select></label>
      </div>
      <template v-if="preview.length">
        <p v-if="mixedBatch" class="admin-error" role="alert">The server returned a mixed batch result. Refresh the guest list and resolve it before another save; confirmed rows will not be resubmitted.</p>
        <p role="status">{{ validCount }} eligible · {{ preview.length - validCount }} need correction. Proposed codes are not active links until server confirmation.</p>
        <div class="admin-row-list" aria-label="Excel row preview"><article v-for="row in preview" :key="row.clientRowId" class="admin-preview-row"><span class="admin-row-number">Row {{ row.rowNumber }}</span><div><strong>{{ row.draft.name || 'Missing name' }}</strong><code>{{ row.draft.shortcode }}</code><span>Maximum {{ row.draft.guestLimit }} guests</span><ul v-if="row.errors.length" class="admin-error"><li v-for="error in row.errors" :key="error">{{ error }}</li></ul><p v-if="results[row.clientRowId]" class="admin-row-result">{{ results[row.clientRowId]?.status }}<span v-if="results[row.clientRowId]?.message">: {{ results[row.clientRowId]?.message }}</span></p></div></article></div>
        <label class="admin-confirm"><input v-model="confirmed" type="checkbox" :disabled="importing">I reviewed the eligible rows and want to save {{ eligible.length }} unresolved invitations.</label>
        <div class="invitation-form invitation-form--light"><button type="button" class="admin-primary" :disabled="!confirmed || !eligible.length || importing || !gateway || listState !== 'ready'" @click="saveImport">{{ importing ? 'Waiting for confirmation…' : Object.keys(results).length ? 'Retry unresolved rows' : 'Save reviewed invitations' }}</button><InvitationFormStatus :message="importStatus" /></div>
      </template>
    </section>
    <section class="admin-guest-list" aria-labelledby="guest-list-title">
      <div class="admin-section-heading"><h2 id="guest-list-title">Invitations</h2><button v-if="gateway" type="button" class="admin-text-button" @click="refresh">Refresh guest list</button></div>
      <div class="invitation-form invitation-form--light"><InvitationFormField id="admin-search" v-model="query" number="Find" label="Search names or codes" placeholder="Search invitations" :disabled="listState !== 'ready'" /></div>
      <p v-if="listState === 'loading'" role="status">Loading private invitations…</p><p v-else-if="listState === 'error'" class="admin-error" role="alert">Unable to load invitations. Refresh the list to retry.</p><p v-else-if="listState === 'unavailable'">The private guest list will appear after storage is connected.</p><p v-else-if="!guests.length">No invitations yet. Add one above or prepare an Excel import.</p><p v-else-if="!visible.length">No invitations match this search.</p>
      <div v-else class="admin-row-list"><article v-for="guest in visible" :key="guest.id" class="admin-guest-row"><div><strong>{{ guest.name }}</strong><code>{{ guest.shortcode }}</code><a v-if="guest.linkToken" :href="`/invite/${encodeURIComponent(guest.linkToken || '')}`">Open invitation</a></div><span>{{ guest.enabled ? 'Active' : 'Disabled' }} · max {{ guest.guestLimit }}</span><button type="button" :disabled="!guest.linkToken" @click="copyLink(guest)">Copy link</button></article></div>
    </section>
  </div>
</template>
<style scoped>
.invitation-workspace { color: #292420; }
h2 { margin: 0 0 16px; font: 400 clamp(26px, 3vw, 36px)/1.2 'Playfair Display', Georgia, serif; }
p { line-height: 1.65; }
.admin-notice { padding: 20px 0; border-block: 1px solid #81766d; line-height: 1.65; margin-bottom: 32px; }
.admin-mode { display: flex; flex-wrap: wrap; gap: 12px; margin: 24px 0 44px; }
.admin-mode button, .admin-primary { padding: 12px 20px; min-height: 48px; border: 1px solid #70645b; color: inherit; background: transparent; }
.admin-mode button[aria-pressed=true], .admin-primary { color: #f1efed; background: #292420; }
.admin-editor { display: grid; grid-template-columns: minmax(0, .85fr) minmax(0, 1fr); gap: clamp(24px, 6vw, 96px); }
.admin-fields { border: 0; margin: 0; padding: 0; min-width: 0; }
.admin-editor > div p { max-width: 38ch; }
.admin-section-heading { display: flex; justify-content: space-between; gap: 24px; align-items: baseline; flex-wrap: wrap; }
.admin-text-button { min-height: 44px; padding: 8px 0; text-decoration: underline; background: none; border: 0; }
.admin-file-label { display: block; margin: 24px 0 12px; font-size: 14px; }
input[type=file] { max-width: 100%; min-height: 48px; }
.admin-mapping { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; margin: 32px 0; }
.admin-mapping label { font-size: 13px; }
select { display: block; width: 100%; min-width: 0; min-height: 48px; margin-top: 10px; border: 1px solid #81766d; background: transparent; padding: 8px; }
.admin-row-list { border-top: 1px solid #81766d; }
.admin-preview-row, .admin-guest-row { display: flex; gap: 24px; align-items: start; padding: 22px 0; border-bottom: 1px solid #a6a09a; overflow-wrap: anywhere; }
.admin-row-number { flex: 0 0 58px; font-size: 12px; }
.admin-preview-row > div, .admin-guest-row > div { min-width: 0; flex: 1; }
.admin-preview-row strong, .admin-preview-row code, .admin-preview-row span:not(.admin-row-number), .admin-guest-row a { display: block; margin-bottom: 8px; }
.admin-guest-row strong { font-weight: 400; }
.admin-guest-row a { font-size: 13px; }
.admin-guest-row button { min-height: 44px; padding: 8px; background: none; border: 1px solid #81766d; }
.admin-error { color: #9d302a; line-height: 1.6; }
.admin-confirm { min-height: 44px; padding: 10px 0; display: flex; gap: 12px; align-items: start; margin: 28px 0; line-height: 1.6; }
.admin-confirm input { flex-shrink: 0; width: 20px; height: 20px; margin-top: 3px; }
.admin-guest-list { margin-top: 72px; padding-top: 40px; border-top: 1px solid #81766d; }
button:disabled { opacity: .5; cursor: not-allowed; }
@media(max-width: 767px) { .admin-editor, .admin-mapping { grid-template-columns: 1fr; } .admin-guest-row { flex-wrap: wrap; } .admin-guest-row > div { flex-basis: 100%; } }
</style>
