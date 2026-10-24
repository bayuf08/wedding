export interface InvitationGuest { id: string; name: string; shortcode: string; guestLimit: number; enabled: boolean; linkToken?: string }
export interface InvitationGuestDraft { name: string; shortcode?: string; guestLimit: number }
export interface InvitationCreateRow extends InvitationGuestDraft { clientRowId: string }
export interface InvitationCreateResult { clientRowId: string; status: 'created' | 'duplicate' | 'rejected' | 'unknown'; guest?: InvitationGuest; message?: string; retryable?: boolean }
export interface InvitationAdminGateway {
  list(): Promise<InvitationGuest[]>
  create(rows: InvitationCreateRow[], operationId: string): Promise<InvitationCreateResult[]>
}
export type InvitationAdminAccess = { status: 'authorized' | 'unauthenticated' | 'forbidden' | 'unavailable' }
export interface WorkbookRow { rowNumber: number; cells: (string | number | null)[]; errors: string[] }
export interface WorkbookData { headers: string[]; rows: WorkbookRow[] }
export interface ImportMapping { name: number; shortcode: number | null; guestLimit: number | null }
export interface ImportPreviewRow { clientRowId: string; rowNumber: number; draft: InvitationGuestDraft; errors: string[] }
