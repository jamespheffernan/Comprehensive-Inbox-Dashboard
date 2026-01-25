import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { Inbox, InboxConfig, InboxState } from '../types'
import { TIMER_WARNING_HOURS, TIMER_DUE_HOURS } from '../types'

// Default inbox configurations
const DEFAULT_INBOXES: InboxConfig[] = [
  // Communication - Email
  { 
    id: 'email-me', 
    name: 'Personal', 
    category: 'communication', 
    type: 'email',
    isManual: false, // Will try iCloud IMAP
    deepLink: 'https://mail.icloud.com/',
    subLabel: '@me.com',
    emailAccount: 'me@icloud.com', // Configure in settings
    icon: '📧'
  },
  { 
    id: 'email-kitchenlux', 
    name: 'KitchenLux', 
    category: 'communication', 
    type: 'email',
    isManual: false, // Will try Gmail API
    deepLink: 'https://mail.google.com/',
    subLabel: 'Work',
    emailAccount: 'kitchenlux@gmail.com', // Configure in settings
    icon: '📧'
  },
  { 
    id: 'email-school', 
    name: 'School', 
    category: 'communication', 
    type: 'email',
    isManual: false, // Will try Gmail API
    deepLink: 'https://mail.google.com/',
    subLabel: 'Education',
    emailAccount: 'school@example.edu', // Configure in settings
    icon: '📧'
  },
  
  // Communication - Messaging
  { 
    id: 'whatsapp', 
    name: 'WhatsApp', 
    category: 'communication', 
    type: 'messaging',
    isManual: false,
    deepLink: 'whatsapp://',
    icon: '💬'
  },
  { 
    id: 'imessage', 
    name: 'iMessage', 
    category: 'communication', 
    type: 'messaging',
    isManual: false,
    deepLink: 'imessage://',
    icon: '💬'
  },
  
  // Device Capture Points
  { 
    id: 'downloads', 
    name: 'Downloads', 
    category: 'device', 
    type: 'files',
    isManual: false,
    folderPath: '~/Downloads',
    icon: '📥'
  },
  { 
    id: 'desktop', 
    name: 'Desktop', 
    category: 'device', 
    type: 'files',
    isManual: false,
    folderPath: '~/Desktop',
    icon: '🖥️'
  },
  { 
    id: 'screenshots', 
    name: 'Screenshots', 
    category: 'device', 
    type: 'files',
    isManual: false,
    folderPath: '~/Pictures/Screenshots',
    icon: '📸'
  },
  { 
    id: 'photos', 
    name: 'Photos', 
    category: 'device', 
    type: 'photos',
    isManual: false,
    deepLink: 'photos://',
    icon: '🖼️'
  },
  
  // Tasks & Browser
  { 
    id: 'omnifocus', 
    name: 'OmniFocus Inbox', 
    category: 'tasks', 
    type: 'tasks',
    isManual: false,
    deepLink: 'omnifocus:///inbox',
    icon: '✅'
  },
  { 
    id: 'browser-tabs', 
    name: 'Browser Tabs', 
    category: 'tasks', 
    type: 'browser',
    isManual: false, // Will fallback to manual if AppleScript fails
    deepLink: 'comet://',
    subLabel: 'Comet',
    icon: '🌐'
  },
  
  // AI Chats
  { 
    id: 'chatgpt', 
    name: 'ChatGPT', 
    category: 'ai', 
    type: 'ai-chat',
    isManual: false,
    deepLink: 'https://chatgpt.com/',
    icon: '🤖'
  },
  { 
    id: 'claude', 
    name: 'Claude', 
    category: 'ai', 
    type: 'ai-chat',
    isManual: false,
    deepLink: 'https://claude.ai/',
    icon: '🧠'
  },
  { 
    id: 'gemini', 
    name: 'Gemini', 
    category: 'ai', 
    type: 'ai-chat',
    isManual: false,
    deepLink: 'https://gemini.google.com/app',
    icon: '✨'
  },
  
  // Physical Inboxes
  { 
    id: 'mailbox', 
    name: 'Physical Mailbox', 
    category: 'physical', 
    type: 'physical',
    isManual: true,
    icon: '📬'
  },
  { 
    id: 'notebooks', 
    name: 'Notebooks', 
    category: 'physical', 
    type: 'physical',
    isManual: true,
    icon: '📓'
  },
  { 
    id: 'backpack', 
    name: 'Backpack Folder', 
    category: 'physical', 
    type: 'physical',
    isManual: true,
    icon: '🎒'
  },
  { 
    id: 'intray', 
    name: 'In-Tray', 
    category: 'physical', 
    type: 'physical',
    isManual: true,
    icon: '📥'
  },
]

interface InboxStoreState {
  inboxes: Record<string, Inbox>
  isLoading: boolean
  lastSyncAt: Date | null
  
  // Actions
  updateInbox: (id: string, updates: Partial<Inbox>) => void
  markAsZero: (id: string) => void
  syncInbox: (id: string) => Promise<void>
  syncAll: () => Promise<void>
  loadPersistedState: () => void
  
  // Computed
  getInboxState: (id: string) => InboxState
  getTimeSinceZero: (id: string) => number | null
  isDue: (id: string) => boolean
}

// Initialize inboxes from config
function initializeInboxes(): Record<string, Inbox> {
  const inboxes: Record<string, Inbox> = {}
  
  for (const config of DEFAULT_INBOXES) {
    inboxes[config.id] = {
      ...config,
      itemCount: null,
      lastZeroAt: null,
      lastCheckedAt: null,
      error: null
    }
  }
  
  return inboxes
}

export const useInboxStore = create<InboxStoreState>()(
  persist(
    (set, get) => ({
      inboxes: initializeInboxes(),
      isLoading: false,
      lastSyncAt: null,

      updateInbox: (id, updates) => {
        set((state) => ({
          inboxes: {
            ...state.inboxes,
            [id]: {
              ...state.inboxes[id],
              ...updates
            }
          }
        }))
      },

      markAsZero: (id) => {
        const now = new Date()
        set((state) => ({
          inboxes: {
            ...state.inboxes,
            [id]: {
              ...state.inboxes[id],
              itemCount: 0,
              lastZeroAt: now,
              lastCheckedAt: now
            }
          }
        }))
      },

      syncInbox: async (id) => {
        const { inboxes, updateInbox } = get()
        const inbox = inboxes[id]
        
        if (!inbox || inbox.isManual) return

        const api = window.electronAPI
        if (!api) {
          updateInbox(id, { error: 'Electron API not available' })
          return
        }

        try {
          let result: { count: number | null; error?: string }

          switch (id) {
            case 'imessage':
              result = await api.getIMessageCount()
              break
            case 'whatsapp':
              result = await api.getWhatsAppCount()
              break
            case 'omnifocus':
              result = await api.getOmniFocusInboxCount()
              break
            case 'downloads':
              result = await api.getDownloadsCount()
              break
            case 'desktop':
              result = await api.getDesktopCount()
              break
            case 'screenshots':
              result = await api.getScreenshotsCount()
              break
            case 'browser-tabs':
              result = await api.getBrowserTabsCount()
              break
            case 'chatgpt':
            case 'claude':
            case 'gemini':
              result = await api.getAIChatsCount(id)
              break
            case 'photos':
              result = await api.getPhotosCount()
              break
            case 'email-me':
            case 'email-kitchenlux':
            case 'email-school':
              // Email requires configuration - show helpful error
              result = { 
                count: null, 
                error: 'Email not configured. Open Settings (Cmd+,) to set up Gmail or iCloud Mail.' 
              }
              break
            default:
              return
          }

          const updates: Partial<Inbox> = {
            lastCheckedAt: new Date(),
            error: result.error || null
          }

          if (result.count !== null) {
            updates.itemCount = result.count
            
            // Auto-detect zero state
            if (result.count === 0 && inbox.itemCount !== 0) {
              updates.lastZeroAt = new Date()
            }
          }

          updateInbox(id, updates)
        } catch (error) {
          updateInbox(id, { 
            error: error instanceof Error ? error.message : 'Unknown error',
            lastCheckedAt: new Date()
          })
        }
      },

      syncAll: async () => {
        set({ isLoading: true })
        
        const { inboxes, syncInbox } = get()
        const syncPromises = Object.keys(inboxes)
          .filter(id => !inboxes[id].isManual)
          .map(id => syncInbox(id))

        await Promise.allSettled(syncPromises)
        
        set({ 
          isLoading: false,
          lastSyncAt: new Date()
        })
      },

      loadPersistedState: () => {
        // Zustand persist handles this automatically
        // This is here for any additional initialization if needed
      },

      getInboxState: (id) => {
        const { inboxes, getTimeSinceZero } = get()
        const inbox = inboxes[id]
        
        if (!inbox) return 'active'
        
        // If has items, it's active
        if (inbox.itemCount && inbox.itemCount > 0) {
          return 'active'
        }
        
        // If at zero, check timer
        const hoursSinceZero = getTimeSinceZero(id)
        
        if (hoursSinceZero === null) {
          return 'active' // Never been at zero
        }
        
        if (hoursSinceZero >= TIMER_DUE_HOURS) {
          return 'due'
        }
        
        if (hoursSinceZero >= TIMER_WARNING_HOURS) {
          return 'warning'
        }
        
        return 'zero'
      },

      getTimeSinceZero: (id) => {
        const { inboxes } = get()
        const inbox = inboxes[id]
        
        if (!inbox?.lastZeroAt) return null
        
        const now = new Date()
        const lastZero = new Date(inbox.lastZeroAt)
        const diffMs = now.getTime() - lastZero.getTime()
        const diffHours = diffMs / (1000 * 60 * 60)
        
        return diffHours
      },

      isDue: (id) => {
        const hoursSinceZero = get().getTimeSinceZero(id)
        return hoursSinceZero !== null && hoursSinceZero >= TIMER_DUE_HOURS
      }
    }),
    {
      name: 'inbox-zero-dashboard-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist inbox state, not loading states
        inboxes: Object.fromEntries(
          Object.entries(state.inboxes).map(([id, inbox]) => [
            id,
            {
              ...inbox,
              // Convert dates to ISO strings for storage
              lastZeroAt: inbox.lastZeroAt?.toISOString() || null,
              lastCheckedAt: inbox.lastCheckedAt?.toISOString() || null
            }
          ])
        )
      }),
      onRehydrateStorage: () => (state) => {
        // Convert ISO strings back to Date objects
        if (state?.inboxes) {
          for (const id in state.inboxes) {
            const inbox = state.inboxes[id]
            if (inbox.lastZeroAt) {
              inbox.lastZeroAt = new Date(inbox.lastZeroAt as unknown as string)
            }
            if (inbox.lastCheckedAt) {
              inbox.lastCheckedAt = new Date(inbox.lastCheckedAt as unknown as string)
            }
          }
        }
      }
    }
  )
)
