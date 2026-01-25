export type InboxCategory = 'communication' | 'device' | 'tasks' | 'ai' | 'physical'

export type InboxType = 
  | 'email' 
  | 'messaging' 
  | 'files' 
  | 'tasks' 
  | 'browser' 
  | 'physical' 
  | 'ai-chat'
  | 'photos'

export interface Inbox {
  id: string
  name: string
  category: InboxCategory
  type: InboxType
  itemCount: number | null
  lastZeroAt: Date | null
  lastCheckedAt: Date | null
  isManual: boolean
  deepLink?: string
  folderPath?: string
  subLabel?: string
  icon?: string
  error?: string | null
}

export interface InboxConfig {
  id: string
  name: string
  category: InboxCategory
  type: InboxType
  isManual: boolean
  deepLink?: string
  folderPath?: string
  subLabel?: string
  icon?: string
  emailAccount?: string
}

// Timer thresholds in hours
export const TIMER_WARNING_HOURS = 12
export const TIMER_DUE_HOURS = 24

// Visual states
export type InboxState = 'zero' | 'active' | 'warning' | 'due'

export interface ElectronAPI {
  getIMessageCount: () => Promise<{ count: number | null; error?: string }>
  getWhatsAppCount: () => Promise<{ count: number | null; error?: string }>
  getOmniFocusInboxCount: () => Promise<{ count: number | null; error?: string }>
  getDownloadsCount: () => Promise<{ count: number | null; error?: string; path?: string }>
  getDesktopCount: () => Promise<{ count: number | null; error?: string; path?: string }>
  getScreenshotsCount: () => Promise<{ count: number | null; error?: string; path?: string }>
  getBrowserTabsCount: () => Promise<{ count: number | null; error?: string; manual?: boolean }>
  getAIChatsCount: (source: string) => Promise<{ count: number | null; error?: string }>
  getPhotosCount: () => Promise<{ count: number | null; error?: string }>
  openDeepLink: (url: string) => Promise<{ success?: boolean; error?: string }>
  openFolder: (path: string) => Promise<{ success?: boolean; error?: string }>
  showNotification: (title: string, body: string) => Promise<{ success?: boolean; error?: string }>
  syncAllInboxes: () => Promise<{ success?: boolean; error?: string; results?: Record<string, unknown> }>
  platform: string
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI
  }
}
