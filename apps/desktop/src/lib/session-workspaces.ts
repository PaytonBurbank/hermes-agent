import type { SessionInfo } from '@/types/hermes'

export const AIRBNB_WORKSPACE_LABEL = 'airbnb management company'
export const UNCLASSIFIED_WORKSPACE_LABEL = 'unclassified workspace'

const CANONICAL_WORKSPACE_PATHS: Record<string, string> = {
  [AIRBNB_WORKSPACE_LABEL]: `/root/${AIRBNB_WORKSPACE_LABEL}`,
  [UNCLASSIFIED_WORKSPACE_LABEL]: `/root/${UNCLASSIFIED_WORKSPACE_LABEL}`
}

const MANAGED_WORKSPACE_PATHS = new Set(Object.values(CANONICAL_WORKSPACE_PATHS))

const AIRBNB_KEYWORDS = [
  'airbnb',
  'estate hosting',
  'nomadics',
  'nomadic',
  'listing',
  'listings',
  'guesty',
  'ota',
  'owner payout',
  'owner statement',
  'book of business',
  'short-term rental',
  'property management',
  'gross revenue',
  'commission projections',
  'valuation'
]

const normalizedPath = (cwd?: null | string): string => (cwd || '').trim().replace(/[/\\]+$/, '')

export function canonicalWorkspacePath(label: string): string {
  return CANONICAL_WORKSPACE_PATHS[label] || `/root/${label}`
}

export function isManagedWorkspacePath(cwd?: null | string): boolean {
  const path = normalizedPath(cwd)
  return path ? MANAGED_WORKSPACE_PATHS.has(path) : false
}

export function inferWorkspaceLabel(session: Pick<SessionInfo, 'cwd' | 'preview' | 'title'>): null | string {
  if (!isManagedWorkspacePath(session.cwd)) {
    return null
  }

  const haystack = `${session.title || ''} ${session.preview || ''}`.toLowerCase()

  if (AIRBNB_KEYWORDS.some(keyword => haystack.includes(keyword))) {
    return AIRBNB_WORKSPACE_LABEL
  }

  return UNCLASSIFIED_WORKSPACE_LABEL
}

export function decorateSessionsWithSmartWorkspaces(sessions: SessionInfo[]): SessionInfo[] {
  return sessions.map(session => {
    const label = inferWorkspaceLabel(session)

    if (!label) {
      return session
    }

    const cwd = canonicalWorkspacePath(label)

    return normalizedPath(session.cwd) === cwd ? session : { ...session, cwd }
  })
}
