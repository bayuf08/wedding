import { decodeWorkbook } from '../utils/invitation-import'
self.onmessage = async (event: MessageEvent<ArrayBuffer>) => {
  try { self.postMessage({ ok: true, data: await decodeWorkbook(event.data) }) }
  catch (error) { self.postMessage({ ok: false, message: error instanceof Error ? error.message : 'Unable to read workbook.' }) }
}
