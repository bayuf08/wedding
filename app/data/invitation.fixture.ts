import data from '../assets/data/invitation.json'
import type { InvitationViewModel } from '../types/invitation'

if (data.content.quote.imageIds.length !== 3 || data.content.profiles.length !== 2) {
  throw new Error('Invitation JSON requires three quote images and two profiles.')
}

// JSON arrays widen to string[]; keep the existing tuple-based component contract.
export const invitationFixture = data as unknown as InvitationViewModel
