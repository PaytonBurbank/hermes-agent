import { afterEach, describe, expect, it } from 'vitest'

import { shouldTreatPasteHotkeyAsClipboardPaste } from '../components/textInput.js'

const envBackup = { ...process.env }

afterEach(() => {
  process.env = { ...envBackup }
})

describe('shouldTreatPasteHotkeyAsClipboardPaste', () => {
  it('accepts Ctrl+V style raw paste forwarding everywhere', () => {
    expect(
      shouldTreatPasteHotkeyAsClipboardPaste({
        actionPasteHotkey: false,
        eventRaw: '\x16',
        hasPasteHandler: true
      })
    ).toBe(true)
  })

  it('accepts remote SSH Meta/Super+V style forwarding when a paste handler exists', () => {
    expect(
      shouldTreatPasteHotkeyAsClipboardPaste({
        actionPasteHotkey: true,
        env: { SSH_CONNECTION: '1 2 3 4', TMUX: '/tmp/tmux-1/default,1,0' } as NodeJS.ProcessEnv,
        eventRaw: '\x1bv',
        hasPasteHandler: true
      })
    ).toBe(true)
  })

  it('does not treat local Linux Alt+V as clipboard paste by default', () => {
    expect(
      shouldTreatPasteHotkeyAsClipboardPaste({
        actionPasteHotkey: true,
        env: {} as NodeJS.ProcessEnv,
        eventRaw: '\x1bv',
        hasPasteHandler: true
      })
    ).toBe(false)
  })

  it('still honors explicit terminal clipboard-hotkey setup', () => {
    expect(
      shouldTreatPasteHotkeyAsClipboardPaste({
        actionPasteHotkey: true,
        env: { TERM_PROGRAM: 'vscode' } as NodeJS.ProcessEnv,
        eventRaw: '\x1bv',
        hasPasteHandler: true
      })
    ).toBe(true)
  })
})
