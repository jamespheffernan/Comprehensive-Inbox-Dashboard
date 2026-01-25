/**
 * Email Connector
 * Handles Gmail API (OAuth2) and iCloud/IMAP email integrations
 * 
 * References:
 * - elie222/inbox-zero: https://github.com/elie222/inbox-zero
 * - googleapis: https://www.npmjs.com/package/googleapis
 * - imapflow: https://www.npmjs.com/package/imapflow
 */

const { google } = require('googleapis')
const path = require('path')
const fs = require('fs')
const os = require('os')

// Config paths
const CONFIG_DIR = path.join(os.homedir(), '.inbox-zero-dashboard')
const GMAIL_CREDENTIALS_PATH = path.join(CONFIG_DIR, 'gmail-credentials.json')
const GMAIL_TOKEN_PATH = path.join(CONFIG_DIR, 'gmail-token.json')

// Gmail OAuth2 scopes - read-only access to labels
const GMAIL_SCOPES = ['https://www.googleapis.com/auth/gmail.labels']

/**
 * Initialize config directory
 */
function ensureConfigDir() {
  if (!fs.existsSync(CONFIG_DIR)) {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
  }
}

/**
 * Load Gmail OAuth2 credentials
 */
function loadGmailCredentials() {
  try {
    if (!fs.existsSync(GMAIL_CREDENTIALS_PATH)) {
      return null
    }
    const content = fs.readFileSync(GMAIL_CREDENTIALS_PATH, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error loading Gmail credentials:', error)
    return null
  }
}

/**
 * Load stored Gmail token
 */
function loadGmailToken() {
  try {
    if (!fs.existsSync(GMAIL_TOKEN_PATH)) {
      return null
    }
    const content = fs.readFileSync(GMAIL_TOKEN_PATH, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error loading Gmail token:', error)
    return null
  }
}

/**
 * Save Gmail token
 */
function saveGmailToken(token) {
  ensureConfigDir()
  fs.writeFileSync(GMAIL_TOKEN_PATH, JSON.stringify(token, null, 2))
}

/**
 * Create Gmail OAuth2 client
 */
function createGmailClient() {
  const credentials = loadGmailCredentials()
  if (!credentials) {
    return null
  }

  const { client_id, client_secret, redirect_uris } = credentials.installed || credentials.web || {}
  
  if (!client_id || !client_secret) {
    return null
  }

  const oauth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris?.[0] || 'urn:ietf:wg:oauth:2.0:oob'
  )

  const token = loadGmailToken()
  if (token) {
    oauth2Client.setCredentials(token)
  }

  return oauth2Client
}

/**
 * Get Gmail unread count using the Gmail API
 */
async function getGmailUnreadCount(accountId = 'default') {
  const oauth2Client = createGmailClient()
  
  if (!oauth2Client) {
    return { 
      count: null, 
      error: 'Gmail not configured. Add credentials to ~/.inbox-zero-dashboard/gmail-credentials.json',
      needsSetup: true
    }
  }

  const token = loadGmailToken()
  if (!token) {
    return {
      count: null,
      error: 'Gmail not authenticated. Run OAuth flow first.',
      needsAuth: true
    }
  }

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client })
    
    // Get INBOX label which includes unread count
    const response = await gmail.users.labels.get({
      userId: 'me',
      id: 'INBOX'
    })

    const unreadCount = response.data.messagesUnread || 0
    
    return { 
      count: unreadCount, 
      error: null,
      total: response.data.messagesTotal
    }
  } catch (error) {
    // Check for auth errors
    if (error.code === 401 || error.message?.includes('invalid_grant')) {
      return {
        count: null,
        error: 'Gmail authentication expired. Please re-authenticate.',
        needsAuth: true
      }
    }
    return { count: null, error: error.message }
  }
}

/**
 * Get iCloud Mail unread count via IMAP
 */
async function getICloudUnreadCount(email, appPassword) {
  // Dynamic import for imapflow (ESM module)
  let ImapFlow
  try {
    const imapflow = require('imapflow')
    ImapFlow = imapflow.ImapFlow
  } catch (e) {
    return { 
      count: null, 
      error: 'imapflow not installed. Run: npm install imapflow' 
    }
  }

  if (!email || !appPassword) {
    return {
      count: null,
      error: 'iCloud email and app-specific password required',
      needsSetup: true
    }
  }

  const client = new ImapFlow({
    host: 'imap.mail.me.com',
    port: 993,
    secure: true,
    auth: {
      user: email,
      pass: appPassword
    },
    logger: false
  })

  try {
    await client.connect()
    
    // Select INBOX and get status
    const mailbox = await client.mailboxOpen('INBOX')
    const unseenCount = mailbox.unseen || 0
    
    await client.logout()
    
    return { 
      count: unseenCount, 
      error: null,
      total: mailbox.exists
    }
  } catch (error) {
    // Clean up on error
    try {
      await client.logout()
    } catch (e) {
      // Ignore logout errors
    }
    
    if (error.message?.includes('Authentication failed')) {
      return {
        count: null,
        error: 'iCloud authentication failed. Check email and app-specific password.',
        needsSetup: true
      }
    }
    
    return { count: null, error: error.message }
  }
}

/**
 * Generate Gmail OAuth2 authorization URL
 */
function getGmailAuthUrl() {
  const oauth2Client = createGmailClient()
  
  if (!oauth2Client) {
    return null
  }

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: GMAIL_SCOPES,
    prompt: 'consent'
  })
}

/**
 * Exchange Gmail authorization code for tokens
 */
async function exchangeGmailCode(code) {
  const oauth2Client = createGmailClient()
  
  if (!oauth2Client) {
    return { error: 'Gmail client not configured' }
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    saveGmailToken(tokens)
    oauth2Client.setCredentials(tokens)
    return { success: true }
  } catch (error) {
    return { error: error.message }
  }
}

/**
 * Check if Gmail is configured
 */
function isGmailConfigured() {
  return loadGmailCredentials() !== null && loadGmailToken() !== null
}

module.exports = {
  getGmailUnreadCount,
  getICloudUnreadCount,
  getGmailAuthUrl,
  exchangeGmailCode,
  isGmailConfigured,
  CONFIG_DIR,
  GMAIL_CREDENTIALS_PATH,
  GMAIL_TOKEN_PATH
}
