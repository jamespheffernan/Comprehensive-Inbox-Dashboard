import { useState } from 'react'
import { X, Palette, Bell, Clock, Mail, ExternalLink } from 'lucide-react'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  currentTheme: string
  onThemeChange: (theme: string) => void
}

const THEMES = [
  { id: 'deep-focus', name: 'Deep Focus', description: 'Dark teal & cyan' },
  { id: 'ocean', name: 'Ocean', description: 'Blue depths' },
  { id: 'forest', name: 'Forest', description: 'Green serenity' },
  { id: 'sunset', name: 'Sunset', description: 'Warm oranges' },
  { id: 'midnight', name: 'Midnight', description: 'Purple nights' },
  { id: 'mono', name: 'Monochrome', description: 'Pure contrast' },
]

export function SettingsModal({ isOpen, onClose, currentTheme, onThemeChange }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState<'appearance' | 'notifications' | 'email'>('appearance')

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Settings</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-tabs">
          <button 
            className={`modal-tab ${activeTab === 'appearance' ? 'active' : ''}`}
            onClick={() => setActiveTab('appearance')}
          >
            <Palette size={16} />
            Appearance
          </button>
          <button 
            className={`modal-tab ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <Bell size={16} />
            Notifications
          </button>
          <button 
            className={`modal-tab ${activeTab === 'email' ? 'active' : ''}`}
            onClick={() => setActiveTab('email')}
          >
            <Mail size={16} />
            Email Setup
          </button>
        </div>

        <div className="modal-body">
          {activeTab === 'appearance' && (
            <div className="settings-section">
              <h3>Theme</h3>
              <p className="settings-description">Choose your preferred color scheme</p>
              <div className="theme-grid">
                {THEMES.map(theme => (
                  <button
                    key={theme.id}
                    className={`theme-option ${currentTheme === theme.id ? 'selected' : ''}`}
                    onClick={() => onThemeChange(theme.id)}
                  >
                    <div className={`theme-preview theme-${theme.id}`} />
                    <span className="theme-name">{theme.name}</span>
                    <span className="theme-desc">{theme.description}</span>
                  </button>
                ))}
              </div>

              <h3>Timer Settings</h3>
              <p className="settings-description">Configure when inboxes become "due"</p>
              <div className="settings-row">
                <label>
                  <Clock size={16} />
                  Warning threshold
                </label>
                <select defaultValue="12">
                  <option value="6">6 hours</option>
                  <option value="12">12 hours</option>
                  <option value="18">18 hours</option>
                </select>
              </div>
              <div className="settings-row">
                <label>
                  <Clock size={16} />
                  Due threshold
                </label>
                <select defaultValue="24">
                  <option value="12">12 hours</option>
                  <option value="24">24 hours</option>
                  <option value="48">48 hours</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="settings-section">
              <h3>Desktop Notifications</h3>
              <p className="settings-description">Get notified when inboxes need attention</p>
              
              <div className="settings-toggle-row">
                <label>Enable notifications for due inboxes</label>
                <input type="checkbox" defaultChecked />
              </div>
              <div className="settings-toggle-row">
                <label>Enable sound for notifications</label>
                <input type="checkbox" />
              </div>
              <div className="settings-toggle-row">
                <label>Show notification badge in dock</label>
                <input type="checkbox" defaultChecked />
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="settings-section">
              <h3>Gmail Setup</h3>
              <p className="settings-description">
                Connect your Gmail account for live unread counts
              </p>
              <ol className="setup-steps">
                <li>
                  Create OAuth credentials in{' '}
                  <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener">
                    Google Cloud Console
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>Download the JSON credentials file</li>
                <li>
                  Save as <code>~/.inbox-zero-dashboard/gmail-credentials.json</code>
                </li>
                <li>Click "Authenticate" below to connect</li>
              </ol>
              <button className="settings-button primary">
                Authenticate with Gmail
              </button>

              <h3 style={{ marginTop: '24px' }}>iCloud Mail Setup</h3>
              <p className="settings-description">
                Connect your iCloud email using an app-specific password
              </p>
              <ol className="setup-steps">
                <li>
                  Generate an app-specific password at{' '}
                  <a href="https://appleid.apple.com/account/manage" target="_blank" rel="noopener">
                    Apple ID
                    <ExternalLink size={12} />
                  </a>
                </li>
                <li>Enter your iCloud email and password below</li>
              </ol>
              <div className="settings-input-row">
                <label>iCloud Email</label>
                <input type="email" placeholder="you@icloud.com" />
              </div>
              <div className="settings-input-row">
                <label>App Password</label>
                <input type="password" placeholder="xxxx-xxxx-xxxx-xxxx" />
              </div>
              <button className="settings-button">
                Save iCloud Settings
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
