import { invitationFixture } from '../data/invitation.fixture'
import { toRouteAccessState, type AccessTransportResult } from './access'
import type { AccessState, InvitationViewModel } from '../types/invitation'

export type InvitationRouteResult =
  | { kind: 'ready'; accessState: AccessState; invitation: InvitationViewModel }
  | { kind: 'protected'; accessState: AccessState }
  | { kind: 'unavailable'; accessState: AccessState }

const transportByShortcode: Readonly<Record<string, AccessTransportResult>> = {
  demo: { status: 'AVAILABLE', mode: 'HYBRID' },
  protected: { status: 'AVAILABLE', mode: 'PROTECTED' },
  unavailable: { status: 'UNAVAILABLE' },
  expired: { status: 'EXPIRED' },
  revoked: { status: 'REVOKED' },
  offline: { status: 'DEPENDENCY_UNAVAILABLE' },
}

export function resolveInvitationRoute(shortcode: string | undefined): InvitationRouteResult {
  const transport = transportByShortcode[shortcode?.toLowerCase() ?? ''] ?? { status: 'UNAVAILABLE' }
  const accessState = toRouteAccessState(transport)

  if (accessState === 'LIVE_PROTECTED') {
    return { kind: 'protected', accessState }
  }

  if (accessState === 'LIVE_PUBLIC' || accessState === 'LIVE_HYBRID') {
    return { kind: 'ready', accessState, invitation: { ...invitationFixture, accessState } }
  }

  return { kind: 'unavailable', accessState }
}
