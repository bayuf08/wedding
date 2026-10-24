import { describe, expect, it } from 'vitest'
import ExcelJS from 'exceljs'
import { canonicalName, decodeWorkbook, inspectWorkbookZip, previewImport, safeSpreadsheetText, suggestMapping, validateGuestDraft } from '../../app/utils/invitation-import'
import type { WorkbookData } from '../../app/types/invitation-admin'
async function workbook(rows: unknown[][]) {
  const book = new ExcelJS.Workbook(), sheet = book.addWorksheet('Guests')
  for (const row of rows) sheet.addRow(row)
  const bytes = await book.xlsx.writeBuffer()
  return Uint8Array.from(new Uint8Array(bytes as ArrayBuffer)).buffer
}
describe('invitation workbook validation', () => {
  it('keeps Unicode and HTML-like names as text, validates counts and reserved codes', () => {
    expect(canonicalName(' Jose\u0301 ')).toBe(canonicalName('José'))
    expect(validateGuestDraft({ name: '<script>alert(1)</script>', guestLimit: 2 })).toEqual([])
    expect(validateGuestDraft({ name: '🙂'.repeat(101), guestLimit: 2 })).toHaveLength(1)
    expect(validateGuestDraft({ name: 'Guest', shortcode: 'demo', guestLimit: 1.5 })).toHaveLength(2)
    expect(validateGuestDraft({ name: 'Guest', shortcode: '../bad', guestLimit: 0 })).toHaveLength(2)
  })
  it('maps backend header aliases and reports duplicate rows/existing guests', () => {
    const data: WorkbookData = { headers: ['name', 'externalId', 'maxAttendees'], rows: [{ rowNumber: 2, cells: ['José', 'same-code', 2], errors: [] }, { rowNumber: 3, cells: ['Jose\u0301', 'same-code', 1], errors: [] }] }
    const mapping = suggestMapping(data.headers)
    expect(mapping).toEqual({ name: 0, shortcode: 1, guestLimit: 2 })
    const existing = [{ id: 'existing', name: 'Other', shortcode: 'same-code', guestLimit: 2, enabled: true }]
    const preview = previewImport(data, mapping, existing, 'operation')
    expect(preview[0]?.errors).toContain('Duplicate name within this file.')
    expect(preview[1]?.errors).toContain('Duplicate shortcode within this file.')
    expect(preview[0]?.errors).toContain('Shortcode already exists.')
    expect(preview[0]?.clientRowId).toBe('operation:2')
    expect(() => previewImport(data, { name: 0, shortcode: 0, guestLimit: null }, [], 'id')).toThrow(/distinct/)
  })
  it('reads literal xlsx cells but rejects formula objects and duplicate headers', async () => {
    const data = await decodeWorkbook(await workbook([['name', 'externalId', 'maxAttendees'], ['Local Guest', 'local-guest', 2], [{ formula: '1+1', result: 2 }, 'formula-row', 1]]))
    expect(data.rows).toHaveLength(2)
    expect(data.rows[0]?.cells[0]).toBe('Local Guest')
    expect(data.rows[1]?.errors.length).toBeGreaterThan(0)
    expect(data.rows[1]?.cells[0]).toBeNull()
    await expect(decodeWorkbook(await workbook([['name', 'name'], ['Guest', 'Other']]))).rejects.toThrow(/unique/)
  })
  it('rejects malformed/oversized files and row limits', async () => {
    expect(() => inspectWorkbookZip(new ArrayBuffer(8))).toThrow()
    expect(() => inspectWorkbookZip(new ArrayBuffer(2 * 1024 * 1024 + 1))).toThrow()
    await expect(decodeWorkbook(await workbook([['name'], ...Array.from({ length: 201 }, (_, index) => [`Guest ${index}`])]))).rejects.toThrow(/200/)
  })
  it('rejects macro parts and oversized expanded ZIP metadata before parsing', async () => {
    const buffer = await workbook([['name'], ['Guest']])
    const bytes = new Uint8Array(buffer), text = new TextDecoder().decode(bytes)
    const marker = text.indexOf('xl/workbook.xml')
    expect(marker).toBeGreaterThan(0)
    const copy = buffer.slice(0), view = new DataView(copy)
    let end = -1
    for (let i = copy.byteLength - 22; i >= 0; i--) if (view.getUint32(i, true) === 0x06054b50) { end = i; break }
    const central = view.getUint32(end + 16, true)
    view.setUint32(central + 24, 21 * 1024 * 1024, true)
    expect(() => inspectWorkbookZip(copy)).toThrow(/20 MiB/)
    const macro = buffer.slice(0), macroBytes = new Uint8Array(macro), macroView = new DataView(macro)
    const start = macroView.getUint32(end + 16, true), length = macroView.getUint16(start + 28, true)
    const name = 'vbaProject.bin'.padEnd(length, 'x').slice(0, length)
    macroBytes.set(new TextEncoder().encode(name), start + 46)
    expect(() => inspectWorkbookZip(macro)).toThrow(/Macros/)
  })
  it('escapes spreadsheet formula prefixes on exported text', () => {
    for (const text of ['=1+1', '+1', '-1', '@SUM(A1)', '\t=1', '  =1']) expect(safeSpreadsheetText(text)).toBe(`'${text}`)
    expect(safeSpreadsheetText('普通の名前')).toBe('普通の名前')
  })
})
