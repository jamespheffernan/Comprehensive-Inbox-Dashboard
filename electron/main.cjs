const { app, BrowserWindow, ipcMain, shell, Notification } = require('electron')
const path = require('path')
const fs = require('fs')
const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

// Connector imports
const messagingConnector = require('./connectors/messaging.cjs')
const omnifocusConnector = require('./connectors/omnifocus.cjs')
const filesystemConnector = require('./connectors/filesystem.cjs')
const browserConnector = require('./connectors/browser.cjs')
const aiChatsConnector = require('./connectors/ai-chats.cjs')
const photosConnector = require('./connectors/photos.cjs')
const emailConnector = require('./connectors/email.cjs')

let mainWindow = null

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1000,
    minHeight: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    titleBarStyle: 'hiddenInset',
    vibrancy: 'under-window',
    visualEffectState: 'active',
    backgroundColor: '#00000000',
  })

  // Load the app
  if (process.env.NODE_ENV === 'development' || !app.isPackaged) {
    // Try to detect the Vite dev server port
    const devServerPort = process.env.VITE_DEV_SERVER_PORT || '5173'
    mainWindow.loadURL(`http://localhost:${devServerPort}`)
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  mainWindow.on('closed', () => {
    mainWindow = null
  })
}

app.whenReady().then(() => {
  createWindow()

  // Initialize file system watchers
  filesystemConnector.initWatchers()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  filesystemConnector.stopWatchers()
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// ============================================
// IPC Handlers - Messaging (iMessage/WhatsApp)
// ============================================

ipcMain.handle('get-imessage-count', async () => {
  try {
    return await messagingConnector.getIMessageUnreadCount()
  } catch (error) {
    console.error('Error getting iMessage count:', error)
    return { error: error.message, count: null }
  }
})

ipcMain.handle('get-whatsapp-count', async () => {
  try {
    return await messagingConnector.getWhatsAppUnreadCount()
  } catch (error) {
    console.error('Error getting WhatsApp count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - OmniFocus
// ============================================

ipcMain.handle('get-omnifocus-inbox-count', async () => {
  try {
    return await omnifocusConnector.getInboxCount()
  } catch (error) {
    console.error('Error getting OmniFocus count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - File System
// ============================================

ipcMain.handle('get-downloads-count', async () => {
  try {
    return await filesystemConnector.getDownloadsCount()
  } catch (error) {
    console.error('Error getting Downloads count:', error)
    return { error: error.message, count: null }
  }
})

ipcMain.handle('get-desktop-count', async () => {
  try {
    return await filesystemConnector.getDesktopCount()
  } catch (error) {
    console.error('Error getting Desktop count:', error)
    return { error: error.message, count: null }
  }
})

ipcMain.handle('get-screenshots-count', async () => {
  try {
    return await filesystemConnector.getScreenshotsCount()
  } catch (error) {
    console.error('Error getting Screenshots count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - Browser Tabs
// ============================================

ipcMain.handle('get-browser-tabs-count', async () => {
  try {
    return await browserConnector.getCometTabsCount()
  } catch (error) {
    console.error('Error getting browser tabs count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - AI Chats
// ============================================

ipcMain.handle('get-ai-chats-count', async (event, { source }) => {
  try {
    return await aiChatsConnector.getNewConversationsCount(source)
  } catch (error) {
    console.error('Error getting AI chats count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - Photos
// ============================================

ipcMain.handle('get-photos-count', async () => {
  try {
    return await photosConnector.getRecentPhotosCount()
  } catch (error) {
    console.error('Error getting Photos count:', error)
    return { error: error.message, count: null }
  }
})

// ============================================
// IPC Handlers - Email
// ============================================

ipcMain.handle('get-gmail-unread-count', async () => {
  try {
    return await emailConnector.getGmailUnreadCount()
  } catch (error) {
    console.error('Error getting Gmail count:', error)
    return { error: error.message, count: null }
  }
})

ipcMain.handle('get-icloud-unread-count', async (event, { email, appPassword }) => {
  try {
    return await emailConnector.getICloudUnreadCount(email, appPassword)
  } catch (error) {
    console.error('Error getting iCloud count:', error)
    return { error: error.message, count: null }
  }
})

ipcMain.handle('get-gmail-auth-url', async () => {
  try {
    const url = emailConnector.getGmailAuthUrl()
    return { url, error: null }
  } catch (error) {
    return { url: null, error: error.message }
  }
})

ipcMain.handle('exchange-gmail-code', async (event, { code }) => {
  try {
    return await emailConnector.exchangeGmailCode(code)
  } catch (error) {
    return { error: error.message }
  }
})

ipcMain.handle('is-gmail-configured', async () => {
  return { configured: emailConnector.isGmailConfigured() }
})

// ============================================
// IPC Handlers - Deep Links & Actions
// ============================================

ipcMain.handle('open-deep-link', async (event, { url }) => {
  try {
    await shell.openExternal(url)
    return { success: true }
  } catch (error) {
    console.error('Error opening deep link:', error)
    return { error: error.message }
  }
})

ipcMain.handle('open-folder', async (event, { path: folderPath }) => {
  try {
    await shell.openPath(folderPath)
    return { success: true }
  } catch (error) {
    console.error('Error opening folder:', error)
    return { error: error.message }
  }
})

// ============================================
// IPC Handlers - Notifications
// ============================================

ipcMain.handle('show-notification', async (event, { title, body }) => {
  try {
    new Notification({ title, body }).show()
    return { success: true }
  } catch (error) {
    console.error('Error showing notification:', error)
    return { error: error.message }
  }
})

// ============================================
// IPC Handlers - Sync All
// ============================================

ipcMain.handle('sync-all-inboxes', async () => {
  const results = {}
  
  try {
    // Parallel fetch for all inbox counts
    const [
      imessage,
      whatsapp,
      omnifocus,
      downloads,
      desktop,
      screenshots,
      browserTabs,
      chatgpt,
      claude,
      gemini,
      photos
    ] = await Promise.allSettled([
      messagingConnector.getIMessageUnreadCount(),
      messagingConnector.getWhatsAppUnreadCount(),
      omnifocusConnector.getInboxCount(),
      filesystemConnector.getDownloadsCount(),
      filesystemConnector.getDesktopCount(),
      filesystemConnector.getScreenshotsCount(),
      browserConnector.getCometTabsCount(),
      aiChatsConnector.getNewConversationsCount('chatgpt'),
      aiChatsConnector.getNewConversationsCount('claude'),
      aiChatsConnector.getNewConversationsCount('gemini'),
      photosConnector.getRecentPhotosCount()
    ])

    results.imessage = imessage.status === 'fulfilled' ? imessage.value : { error: imessage.reason?.message }
    results.whatsapp = whatsapp.status === 'fulfilled' ? whatsapp.value : { error: whatsapp.reason?.message }
    results.omnifocus = omnifocus.status === 'fulfilled' ? omnifocus.value : { error: omnifocus.reason?.message }
    results.downloads = downloads.status === 'fulfilled' ? downloads.value : { error: downloads.reason?.message }
    results.desktop = desktop.status === 'fulfilled' ? desktop.value : { error: desktop.reason?.message }
    results.screenshots = screenshots.status === 'fulfilled' ? screenshots.value : { error: screenshots.reason?.message }
    results.browserTabs = browserTabs.status === 'fulfilled' ? browserTabs.value : { error: browserTabs.reason?.message }
    results.chatgpt = chatgpt.status === 'fulfilled' ? chatgpt.value : { error: chatgpt.reason?.message }
    results.claude = claude.status === 'fulfilled' ? claude.value : { error: claude.reason?.message }
    results.gemini = gemini.status === 'fulfilled' ? gemini.value : { error: gemini.reason?.message }
    results.photos = photos.status === 'fulfilled' ? photos.value : { error: photos.reason?.message }

    return { success: true, results }
  } catch (error) {
    console.error('Error syncing all inboxes:', error)
    return { error: error.message, results }
  }
})
