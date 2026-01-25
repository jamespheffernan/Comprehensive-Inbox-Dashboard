import { useState, useEffect } from 'react'
import type { InboxState } from '../types'
import { TIMER_DUE_HOURS } from '../types'

interface TimerDisplayProps {
  lastZeroAt: Date | null
  state: InboxState
}

export function TimerDisplay({ lastZeroAt, state }: TimerDisplayProps) {
  const [displayTime, setDisplayTime] = useState<string>('')

  useEffect(() => {
    const updateTimer = () => {
      if (!lastZeroAt) {
        setDisplayTime('—')
        return
      }

      const now = new Date()
      const lastZero = new Date(lastZeroAt)
      const diffMs = now.getTime() - lastZero.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)

      if (diffHours >= TIMER_DUE_HOURS) {
        setDisplayTime(`DUE ${diffHours}h`)
      } else if (diffHours >= 1) {
        setDisplayTime(`${diffHours}h since ∅`)
      } else if (diffMinutes >= 1) {
        setDisplayTime(`${diffMinutes}m since ∅`)
      } else {
        setDisplayTime('Just cleared')
      }
    }

    // Update immediately
    updateTimer()

    // Update every minute
    const interval = setInterval(updateTimer, 60000)

    return () => clearInterval(interval)
  }, [lastZeroAt])

  const stateClasses = {
    zero: 'timer-zero',
    active: 'timer-active',
    warning: 'timer-warning',
    due: 'timer-due'
  }

  return (
    <span className={`timer-display ${stateClasses[state]}`}>
      {displayTime}
    </span>
  )
}
