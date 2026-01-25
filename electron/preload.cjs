const { contextBridge, ipcRenderer } = require('electron')

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Messaging
  getIMessageCount: () => ipcRenderer.invoke('get-imessage-count'),
  getWhatsAppCount: () => ipcRenderer.invoke('get-whatsapp-count'),
  
  // OmniFocus
  getOmniFocusInboxCount: () => ipcRenderer.invoke('get-omnifocus-inbox-count'),
  
  // File System
  getDownloadsCount: () => ipcRenderer.invoke('get-downloads-count'),
  getDesktopCount: () => ipcRenderer.invoke('get-desktop-count'),
  getScreenshotsCount: () => ipcRenderer.invoke('get-screenshots-count'),
  
  // Browser
  getBrowserTabsCount: () => ipcRenderer.invoke('get-browser-tabs-count'),
  
  // AI Chats
  getAIChatsCount: (source) => ipcRenderer.invoke('get-ai-chats-count', { source }),
  
  // Photos
  getPhotosCount: () => ipcRenderer.invoke('get-photos-count'),
  
  // Email
  getGmailUnreadCount: () => ipcRenderer.invoke('get-gmail-unread-count'),
  getICloudUnreadCount: (email, appPassword) => ipcRenderer.invoke('get-icloud-unread-count', { email, appPassword }),
  getGmailAuthUrl: () => ipcRenderer.invoke('get-gmail-auth-url'),
  exchangeGmailCode: (code) => ipcRenderer.invoke('exchange-gmail-code', { code }),
  isGmailConfigured: () => ipcRenderer.invoke('is-gmail-configured'),
  
  // Actions
  openDeepLink: (url) => ipcRenderer.invoke('open-deep-link', { url }),
  openFolder: (path) => ipcRenderer.invoke('open-folder', { path }),
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Sync
  syncAllInboxes: () => ipcRenderer.invoke('sync-all-inboxes'),
  
  // Platform info
  platform: process.platform,
})
