import type { ImportMapping, ImportPreviewRow, InvitationGuest, InvitationGuestDraft, WorkbookData } from '../types/invitation-admin'
export const IMPORT_LIMITS = { fileBytes: 2 * 1024 * 1024, expandedBytes: 20 * 1024 * 1024, entries: 500, rows: 200, columns: 20 } as const
const reserved = new Set(['demo', 'protected', 'unavailable', 'expired', 'revoked', 'offline', 'manage-invitations'])
export const canonicalName = (name: string) => name.normalize('NFC').trim().replace(/\s+/gu, ' ').toLowerCase()
export function validateGuestDraft(draft: InvitationGuestDraft): string[] {
  const errors: string[] = []
  const length = Array.from(draft.name.trim()).length
  if (!length || length > 100 || /[\u0000-\u001f\u007f]/u.test(draft.name)) errors.push('Name must contain 1–100 readable characters.')
  if (draft.shortcode && (!/^[a-z0-9][a-z0-9-]{1,62}[a-z0-9]$/.test(draft.shortcode) || reserved.has(draft.shortcode))) errors.push('Shortcode must be 3–64 lowercase letters, digits or hyphens, and cannot use a reserved route.')
  if (!Number.isInteger(draft.guestLimit) || draft.guestLimit < 1 || draft.guestLimit > 2) errors.push('Guest limit must be 1 or 2.')
  return errors
}
export function suggestMapping(headers: string[]): ImportMapping {
  const normalized = headers.map(header => header.trim().toLowerCase().replace(/[ _-]/g, ''))
  const find = (aliases: string[]) => { const index = normalized.findIndex(header => aliases.includes(header)); return index < 0 ? null : index }
  return { name: find(['name', 'guestname', 'nama']) ?? -1, shortcode: find(['shortcode', 'externalid', 'slug', 'kode']), guestLimit: find(['guestlimit', 'maxattendees', 'maxguests', 'batastamu']) }
}
export function previewImport(data: WorkbookData, mapping: ImportMapping, existing: InvitationGuest[], operationId: string): ImportPreviewRow[] {
  const indices = [mapping.name, mapping.shortcode, mapping.guestLimit].filter((value): value is number => value !== null)
  if (mapping.name < 0 || indices.some(index => index < 0 || index >= data.headers.length) || new Set(indices).size !== indices.length) throw new Error('Choose a name column and distinct columns for every mapped field.')
  const rows = data.rows.map(row => {
    const rawName = row.cells[mapping.name]
    const rawCode = mapping.shortcode === null ? '' : row.cells[mapping.shortcode]
    const rawLimit = mapping.guestLimit === null ? 2 : row.cells[mapping.guestLimit]
    const draft: InvitationGuestDraft = { name: typeof rawName === 'string' ? rawName.normalize('NFC').trim() : '', shortcode: typeof rawCode === 'string' && rawCode.trim() ? rawCode.trim().toLowerCase() : undefined, guestLimit: rawLimit === null || rawLimit === '' || rawLimit === undefined ? 2 : Number(rawLimit) }
    const errors = [...row.errors, ...validateGuestDraft(draft)]
    if (rawCode !== null && rawCode !== '' && rawCode !== undefined && typeof rawCode !== 'string') errors.push('Shortcode must be a text cell.')
    if (existing.some(guest => canonicalName(guest.name) === canonicalName(draft.name))) errors.push('This name already exists in the guest list. Review before adding a second invitation.')
    if (draft.shortcode && existing.some(guest => guest.shortcode === draft.shortcode)) errors.push('Shortcode already exists.')
    return { clientRowId: `${operationId}:${row.rowNumber}`, rowNumber: row.rowNumber, draft, errors }
  })
  const names = new Map<string, number>(), codes = new Map<string, number>()
  for (const row of rows) { const name = canonicalName(row.draft.name); names.set(name, (names.get(name) || 0) + 1); if (row.draft.shortcode) codes.set(row.draft.shortcode, (codes.get(row.draft.shortcode) || 0) + 1) }
  for (const row of rows) { if (row.draft.name && (names.get(canonicalName(row.draft.name)) || 0) > 1) row.errors.push('Duplicate name within this file.'); if (row.draft.shortcode && (codes.get(row.draft.shortcode) || 0) > 1) row.errors.push('Duplicate shortcode within this file.') }
  return rows
}
export function safeSpreadsheetText(value: string): string { return /^\s*[=+\-@]|^[\t\r\n]/.test(value) ? `'${value}` : value }
export function inspectWorkbookZip(buffer: ArrayBuffer): void {
  if (buffer.byteLength > IMPORT_LIMITS.fileBytes || buffer.byteLength < 22) throw new Error('Choose an .xlsx file up to 2 MiB.')
  const view = new DataView(buffer)
  let end = -1
  for (let offset = buffer.byteLength - 22; offset >= Math.max(0, buffer.byteLength - 65557); offset--) if (view.getUint32(offset, true) === 0x06054b50) { end = offset; break }
  if (end < 0) throw new Error('This is not a supported Excel workbook.')
  const count = view.getUint16(end + 10, true), start = view.getUint32(end + 16, true)
  if (!count || count > IMPORT_LIMITS.entries || count === 65535 || view.getUint16(end + 4, true) !== 0 || view.getUint16(end + 6, true) !== 0) throw new Error('Workbook archive structure is unsupported.')
  let offset = start, expanded = 0, foundWorkbook = false
  for (let entry = 0; entry < count; entry++) {
    if (offset + 46 > end || view.getUint32(offset, true) !== 0x02014b50) throw new Error('Workbook archive is damaged.')
    const flags = view.getUint16(offset + 8, true), size = view.getUint32(offset + 24, true), nameLength = view.getUint16(offset + 28, true), extraLength = view.getUint16(offset + 30, true), commentLength = view.getUint16(offset + 32, true)
    if (offset + 46 + nameLength + extraLength + commentLength > end || flags & 1 || size === 0xffffffff) throw new Error('Encrypted or ZIP64 workbooks are not supported.')
    const name = new TextDecoder().decode(new Uint8Array(buffer, offset + 46, nameLength)).toLowerCase()
    if (/vbaproject|externallinks|connections\.xml|(^|\/)\.\.(\/|$)/.test(name)) throw new Error('Macros, external workbook links and unsafe archive paths are not supported.')
    if (name === 'xl/workbook.xml') foundWorkbook = true
    expanded += size
    if (expanded > IMPORT_LIMITS.expandedBytes) throw new Error('Workbook expands beyond the 20 MiB limit.')
    offset += 46 + nameLength + extraLength + commentLength
  }
  if (!foundWorkbook) throw new Error('The file is not an .xlsx workbook.')
}
export async function decodeWorkbook(buffer: ArrayBuffer): Promise<WorkbookData> {
  inspectWorkbookZip(buffer)
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  await workbook.xlsx.load(buffer as never)
  const sheet = workbook.worksheets.find(item => item.state === 'visible')
  if (!sheet || sheet.rowCount < 1) throw new Error('The workbook has no visible sheet with headers.')
  if (sheet.rowCount > IMPORT_LIMITS.rows + 1 || sheet.columnCount > IMPORT_LIMITS.columns) throw new Error('Use at most 200 data rows and 20 columns.')
  const headers: string[] = []
  for (let column = 1; column <= sheet.columnCount; column++) { const value = sheet.getRow(1).getCell(column).value; if (value !== null && typeof value !== 'string') throw new Error('Headers must be literal text, not formulas or objects.'); headers.push(typeof value === 'string' ? value.trim() : `Column ${column}`) }
  if (new Set(headers.map(header => header.toLowerCase())).size !== headers.length) throw new Error('Header names must be unique.')
  const rows: WorkbookData['rows'] = []
  for (let rowNumber = 2; rowNumber <= sheet.rowCount; rowNumber++) {
    const cells: (string | number | null)[] = [], errors: string[] = []
    for (let column = 1; column <= sheet.columnCount; column++) {
      const value = sheet.getRow(rowNumber).getCell(column).value
      if (value === null || value === undefined) cells.push(null)
      else if (typeof value === 'string' || typeof value === 'number') cells.push(value)
      else { cells.push(null); errors.push('Only literal text and number cells are accepted; formulas and linked/object cells are rejected.') }
    }
    if (cells.some(value => value !== null && value !== '') || errors.length) rows.push({ rowNumber, cells, errors: [...new Set(errors)] })
  }
  if (!rows.length) throw new Error('The workbook contains no guest rows.')
  return { headers, rows }
}
export async function createInvitationTemplate(): Promise<ArrayBuffer> {
  const ExcelJS = (await import('exceljs')).default
  const workbook = new ExcelJS.Workbook()
  const sheet = workbook.addWorksheet('Invitations')
  sheet.addRow(['name', 'externalId', 'maxAttendees'])
  sheet.columns = [{ width: 34 }, { width: 28 }, { width: 16 }]
  const instructions = workbook.addWorksheet('Instructions')
  for (const text of ['Name is required, 1–100 Unicode characters.', 'Shortcode is optional; leave blank for server generation.', 'Guest limit is 1 or 2; blank means a visible default upper limit of 2.', 'Only the first visible sheet is imported. Maximum 200 rows, 2 MiB.', 'Use literal values. Formulas, macros and linked cells are not accepted.']) instructions.addRow([safeSpreadsheetText(text)])
  return await workbook.xlsx.writeBuffer() as unknown as ArrayBuffer
}
export function readWorkbookFile(file: File): Promise<WorkbookData> {
  if (!/\.xlsx$/i.test(file.name) || file.size > IMPORT_LIMITS.fileBytes) return Promise.reject(new Error('Choose an .xlsx file up to 2 MiB.'))
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('../workers/invitation-import.worker.ts', import.meta.url), { type: 'module' })
    const timer = setTimeout(() => { worker.terminate(); reject(new Error('Workbook processing took too long. Use a smaller, simpler file.')) }, 8000)
    const finish = () => { clearTimeout(timer); worker.terminate() }
    worker.onmessage = event => { finish(); event.data.ok ? resolve(event.data.data) : reject(new Error(event.data.message || 'Unable to read this workbook.')) }
    worker.onerror = () => { finish(); reject(new Error('Unable to read this workbook.')) }
    file.arrayBuffer().then(buffer => worker.postMessage(buffer, [buffer])).catch(() => { finish(); reject(new Error('Unable to open this file.')) })
  })
}
