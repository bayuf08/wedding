import type { AccessState } from '../types/invitation'

export type AccessTransportResult =
  | { status: 'AVAILABLE'; mode: 'PUBLIC' | 'PROTECTED' | 'HYBRID' }
  | { status: 'UNAVAILABLE' }
  | { status: 'EXPIRED' }
  | { status: 'REVOKED' }
  | { status: 'DEPENDENCY_UNAVAILABLE' }

export function toRouteAccessState(result: AccessTransportResult): AccessState {
  if (result.status === 'AVAILABLE') {
    return `LIVE_${result.mode}`
  }

  return result.status
}
