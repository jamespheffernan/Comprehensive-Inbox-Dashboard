import { useEffect } from 'react'
import { Dashboard } from './components/Dashboard'
import { useInboxStore } from './store/inboxStore'
import { useNotifications } from './hooks/useNotifications'

function App() {
  const { syncAll, loadPersistedState } = useInboxStore()
  
  // Enable desktop notifications for due inboxes
  useNotifications()

  useEffect(() => {
    // Load persisted state on mount
    loadPersistedState()
    
    // Initial sync
    syncAll()

    // Set up periodic sync (every 60 seconds)
    const interval = setInterval(() => {
      syncAll()
    }, 60000)

    return () => clearInterval(interval)
  }, [syncAll, loadPersistedState])

  return (
    <div className="app">
      <Dashboard />
    </div>
  )
}

export default App
