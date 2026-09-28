export type ExternalUrlPurpose = 'map' | 'contact' | 'email' | 'phone'

const webProtocols = new Set(['http:', 'https:'])

export function toSafeExternalUrl(value: string | null | undefined, purpose: ExternalUrlPurpose): string | null {
  const candidate = value?.trim()
  if (!candidate) {
    return null
  }

  if (purpose === 'email' && candidate.startsWith('mailto:')) {
    return isValidSpecialUrl(candidate, 'mailto:') ? candidate : null
  }

  if (purpose === 'phone' && candidate.startsWith('tel:')) {
    return isValidSpecialUrl(candidate, 'tel:') ? candidate : null
  }

  if (!/^https?:\/\//i.test(candidate)) {
    return null
  }

  try {
    const url = new URL(candidate)
    return webProtocols.has(url.protocol) && url.hostname ? url.toString() : null
  } catch {
    return null
  }
}

function isValidSpecialUrl(candidate: string, protocol: 'mailto:' | 'tel:'): boolean {
  try {
    const url = new URL(candidate)
    return url.protocol === protocol && url.pathname.length > 0
  } catch {
    return false
  }
}
