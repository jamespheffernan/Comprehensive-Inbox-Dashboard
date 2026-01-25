import { useCallback } from 'react'
import { TimerDisplay } from './TimerDisplay'
import { useInboxStore } from '../store/inboxStore'
import type { Inbox, InboxState } from '../types'
import { ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'

interface InboxCardProps {
  inbox: Inbox
}

export function InboxCard({ inbox }: InboxCardProps) {
  const { markAsZero, getInboxState } = useInboxStore()
  
  const state: InboxState = getInboxState(inbox.id)

  const handleClick = useCallback(async () => {
    if (inbox.isManual) {
      // For manual inboxes, clicking marks as zero
      markAsZero(inbox.id)
    } else if (inbox.deepLink) {
      // Open the deep link
      window.electronAPI?.openDeepLink(inbox.deepLink)
    } else if (inbox.folderPath) {
      // Open the folder
      const path = inbox.folderPath.replace('~', process.env.HOME || '')
      window.electronAPI?.openFolder(path)
    }
  }, [inbox, markAsZero])

  const handleMarkZero = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    markAsZero(inbox.id)
  }, [inbox.id, markAsZero])

  const stateClasses = {
    zero: 'state-zero',
    active: 'state-active',
    warning: 'state-warning',
    due: 'state-due'
  }

  return (
    <div 
      className={`inbox-card ${stateClasses[state]} ${inbox.isManual ? 'manual' : ''}`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
    >
      <div className="card-header">
        <span className="card-icon">{inbox.icon}</span>
        <div className="card-title-group">
          <h3 className="card-title">{inbox.name}</h3>
          {inbox.subLabel && (
            <span className="card-sublabel">{inbox.subLabel}</span>
          )}
        </div>
        {!inbox.isManual && (inbox.deepLink || inbox.folderPath) && (
          <ExternalLink size={14} className="card-link-icon" />
        )}
      </div>

      <div className="card-body">
        {inbox.error ? (
          <div className="card-error">
            <AlertCircle size={16} />
            <span>{inbox.error}</span>
          </div>
        ) : inbox.isManual ? (
          <div className="card-manual">
            <button 
              className="tap-to-clear"
              onClick={handleMarkZero}
            >
              <CheckCircle size={20} />
              <span>Tap to clear</span>
            </button>
          </div>
        ) : (
          <div className="card-count">
            {inbox.itemCount === null ? (
              <span className="count-loading">--</span>
            ) : inbox.itemCount === 0 ? (
              <span className="count-zero">✓</span>
            ) : (
              <span className="count-number">{inbox.itemCount}</span>
            )}
          </div>
        )}
      </div>

      <div className="card-footer">
        <TimerDisplay 
          lastZeroAt={inbox.lastZeroAt} 
          state={state}
        />
        {!inbox.isManual && inbox.itemCount !== null && inbox.itemCount > 0 && (
          <button 
            className="mark-zero-btn"
            onClick={handleMarkZero}
            title="Mark as cleared"
          >
            <CheckCircle size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
