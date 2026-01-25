import { X, Keyboard, Zap } from 'lucide-react'

interface HelpOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function HelpOverlay({ isOpen, onClose }: HelpOverlayProps) {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content help-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>
            <Keyboard size={20} />
            Keyboard Shortcuts & Tips
          </h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <section className="help-section">
            <h3><Keyboard size={16} /> Keyboard Shortcuts</h3>
            <div className="shortcuts-grid">
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>R</kbd>
                <span>Sync all inboxes</span>
              </div>
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>,</kbd>
                <span>Open settings</span>
              </div>
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>/</kbd>
                <span>Show this help</span>
              </div>
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>Q</kbd>
                <span>Quit app</span>
              </div>
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>W</kbd>
                <span>Close window</span>
              </div>
              <div className="shortcut-row">
                <kbd>⌘</kbd> <kbd>M</kbd>
                <span>Minimize window</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3><Zap size={16} /> Quick Tips</h3>
            <ul className="tips-list">
              <li>
                <strong>Click any inbox card</strong> to open that app/folder directly
              </li>
              <li>
                <strong>Physical inboxes</strong> use "Tap to clear" - click when you've processed them
              </li>
              <li>
                <strong>Timer colors:</strong>
                <span className="color-demo green">Green</span> = At zero,
                <span className="color-demo blue">Blue</span> = Active,
                <span className="color-demo orange">Orange</span> = 12h warning,
                <span className="color-demo red">Red</span> = 24h due
              </li>
              <li>
                <strong>Auto-sync</strong> happens every 60 seconds - or click refresh anytime
              </li>
              <li>
                <strong>Notifications</strong> trigger when an inbox hits 24 hours overdue
              </li>
              <li>
                <strong>State persists</strong> - your timer positions are saved across restarts
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>GTD Workflow</h3>
            <ol className="workflow-list">
              <li>
                <strong>Capture:</strong> All inboxes automatically track new items
              </li>
              <li>
                <strong>Clarify:</strong> Click an inbox to process items
              </li>
              <li>
                <strong>Clear to Zero:</strong> When done, items auto-clear or you manually mark
              </li>
              <li>
                <strong>Timer Starts:</strong> Dashboard tracks time since last zero
              </li>
              <li>
                <strong>Stay Current:</strong> Process each inbox within 24 hours
              </li>
            </ol>
          </section>

          <section className="help-section">
            <h3>Need Help?</h3>
            <p>
              Check the <code>SETUP.md</code> and <code>INTEGRATIONS.md</code> files
              in the project directory for detailed setup instructions and troubleshooting.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
