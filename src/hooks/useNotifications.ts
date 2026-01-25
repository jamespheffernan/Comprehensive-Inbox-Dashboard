import { useEffect, useRef } from 'react'
import { useInboxStore } from '../store/inboxStore'
import { TIMER_DUE_HOURS } from '../types'

/**
 * Hook to handle desktop notifications for due inboxes
 */
export function useNotifications() {
  const { inboxes, getTimeSinceZero } = useInboxStore()
  const notifiedInboxes = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Check for newly due inboxes
    const checkDueInboxes = () => {
      for (const [id, inbox] of Object.entries(inboxes)) {
        const hoursSinceZero = getTimeSinceZero(id)
        
        // Skip if never been at zero or not due yet
        if (hoursSinceZero === null || hoursSinceZero < TIMER_DUE_HOURS) {
          // Remove from notified set if no longer due
          notifiedInboxes.current.delete(id)
          continue
        }

        // Skip if already notified for this due period
        if (notifiedInboxes.current.has(id)) {
          continue
        }

        // Send notification
        const hoursOverdue = Math.floor(hoursSinceZero - TIMER_DUE_HOURS)
        const title = `${inbox.icon} ${inbox.name} needs attention`
        const body = hoursOverdue > 0 
          ? `${hoursOverdue}h overdue for processing`
          : 'Due for processing'

        window.electronAPI?.showNotification(title, body)
        
        // Mark as notified
        notifiedInboxes.current.add(id)
      }
    }

    // Check immediately
    checkDueInboxes()

    // Check every 5 minutes
    const interval = setInterval(checkDueInboxes, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [inboxes, getTimeSinceZero])
}
