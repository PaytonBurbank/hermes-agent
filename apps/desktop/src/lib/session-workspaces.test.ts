import { describe, expect, it } from 'vitest'

import type { SessionInfo } from '@/types/hermes'

import {
  AIRBNB_WORKSPACE_LABEL,
  canonicalWorkspacePath,
  decorateSessionsWithSmartWorkspaces,
  inferWorkspaceLabel,
  isManagedWorkspacePath,
  UNCLASSIFIED_WORKSPACE_LABEL
} from './session-workspaces'

function session(overrides: Partial<SessionInfo> = {}): SessionInfo {
  return {
    cwd: '/root/unclassified workspace',
    ended_at: null,
    id: 'session-1',
    input_tokens: 0,
    is_active: false,
    last_active: 0,
    message_count: 1,
    model: null,
    output_tokens: 0,
    preview: 'General system setup discussion',
    source: 'tui',
    started_at: 0,
    title: 'General system setup',
    tool_call_count: 0,
    ...overrides
  }
}

describe('session smart workspaces', () => {
  it('treats the curated workspace directories as managed', () => {
    expect(isManagedWorkspacePath('/root/unclassified workspace')).toBe(true)
    expect(isManagedWorkspacePath('/root/airbnb management company')).toBe(true)
    expect(isManagedWorkspacePath('/repo/hermes-agent')).toBe(false)
    expect(isManagedWorkspacePath(null)).toBe(false)
  })

  it('routes Airbnb-like sessions into the Airbnb workspace', () => {
    const label = inferWorkspaceLabel(
      session({
        preview: 'Need listing revenue and owner payout details for Nomadics due diligence',
        title: 'Nomadics valuation package'
      })
    )

    expect(label).toBe(AIRBNB_WORKSPACE_LABEL)
  })

  it('leaves true no-workspace sessions alone', () => {
    expect(inferWorkspaceLabel(session({ cwd: null, preview: 'Telegram router chat' }))).toBeNull()
  })

  it('falls back to unclassified for non-Airbnb managed sessions', () => {
    const label = inferWorkspaceLabel(
      session({
        preview: 'Telegram router and Hermes profile routing',
        title: 'Telegram master bot routing'
      })
    )

    expect(label).toBe(UNCLASSIFIED_WORKSPACE_LABEL)
  })

  it('rewrites managed session rows onto the canonical workspace path', () => {
    const [decorated] = decorateSessionsWithSmartWorkspaces([
      session({
        cwd: '/root/unclassified workspace',
        preview: 'Airbnb owner statement and listing commission review',
        title: 'Owner statement review'
      })
    ])

    expect(decorated.cwd).toBe(canonicalWorkspacePath(AIRBNB_WORKSPACE_LABEL))
  })

  it('preserves non-managed project sessions', () => {
    const [decorated] = decorateSessionsWithSmartWorkspaces([
      session({ cwd: '/root/code/hermes-mirror', preview: 'Fix unit test failure' })
    ])

    expect(decorated.cwd).toBe('/root/code/hermes-mirror')
  })
})
