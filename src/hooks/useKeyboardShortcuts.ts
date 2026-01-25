import { useEffect } from 'react'

interface KeyboardShortcutsConfig {
  onRefresh: () => void
  onSettings: () => void
  onHelp: () => void
}

export function useKeyboardShortcuts({ onRefresh, onSettings, onHelp }: KeyboardShortcutsConfig) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+R - Refresh/Sync
      if (e.metaKey && e.key === 'r') {
        e.preventDefault()
        onRefresh()
      }

      // Cmd+, - Settings
      if (e.metaKey && e.key === ',') {
        e.preventDefault()
        onSettings()
      }

      // Cmd+/ - Help
      if (e.metaKey && e.key === '/') {
        e.preventDefault()
        onHelp()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onRefresh, onSettings, onHelp])
}
