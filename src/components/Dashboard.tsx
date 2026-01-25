import { useMemo, useState } from 'react'
import { InboxCard } from './InboxCard'
import { SettingsModal } from './SettingsModal'
import { HelpOverlay } from './HelpOverlay'
import { useInboxStore } from '../store/inboxStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import type { InboxCategory } from '../types'
import { RefreshCw, Settings, HelpCircle } from 'lucide-react'

const CATEGORY_LABELS: Record<InboxCategory, string> = {
  communication: 'Communication',
  device: 'Device Capture',
  tasks: 'Tasks & Browser',
  ai: 'AI Chats',
  physical: 'Physical Inboxes'
}

const CATEGORY_ORDER: InboxCategory[] = [
  'communication',
  'device',
  'tasks',
  'ai',
  'physical'
]

export function Dashboard() {
  const { inboxes, isLoading, lastSyncAt, syncAll } = useInboxStore()
  const [showSettings, setShowSettings] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [currentTheme, setCurrentTheme] = useState('deep-focus')

  // Keyboard shortcuts
  useKeyboardShortcuts({
    onRefresh: () => syncAll(),
    onSettings: () => setShowSettings(true),
    onHelp: () => setShowHelp(true)
  })

  // Group inboxes by category
  const groupedInboxes = useMemo(() => {
    const groups: Record<InboxCategory, typeof inboxes[string][]> = {
      communication: [],
      device: [],
      tasks: [],
      ai: [],
      physical: []
    }

    for (const inbox of Object.values(inboxes)) {
      groups[inbox.category].push(inbox)
    }

    return groups
  }, [inboxes])

  // Count due inboxes
  const dueCount = useMemo(() => {
    return Object.values(inboxes).filter(inbox => {
      const state = useInboxStore.getState().getInboxState(inbox.id)
      return state === 'due'
    }).length
  }, [inboxes])

  const formatLastSync = (date: Date | null) => {
    if (!date) return 'Never'
    const now = new Date()
    const diff = now.getTime() - new Date(date).getTime()
    const minutes = Math.floor(diff / 60000)
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    return `${Math.floor(minutes / 60)}h ago`
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>Inbox Zero Dashboard</h1>
          {dueCount > 0 && (
            <span className="due-badge">{dueCount} due</span>
          )}
        </div>
        <div className="header-right">
          <span className="sync-status">
            Last sync: {formatLastSync(lastSyncAt)}
          </span>
          <button 
            className={`sync-button ${isLoading ? 'loading' : ''}`}
            onClick={() => syncAll()}
            disabled={isLoading}
            title="Sync all inboxes"
          >
            <RefreshCw size={18} />
          </button>
          <button 
            className="settings-button" 
            title="Settings (⌘,)"
            onClick={() => setShowSettings(true)}
          >
            <Settings size={18} />
          </button>
          <button 
            className="settings-button" 
            title="Help (⌘/)"
            onClick={() => setShowHelp(true)}
          >
            <HelpCircle size={18} />
          </button>
        </div>
      </header>

      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentTheme={currentTheme}
        onThemeChange={setCurrentTheme}
      />

      <HelpOverlay 
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />

      <main className="dashboard-content">
        {CATEGORY_ORDER.map(category => (
          <section key={category} className="inbox-section">
            <h2 className="section-title">{CATEGORY_LABELS[category]}</h2>
            <div className="inbox-grid">
              {groupedInboxes[category].map(inbox => (
                <InboxCard key={inbox.id} inbox={inbox} />
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}
