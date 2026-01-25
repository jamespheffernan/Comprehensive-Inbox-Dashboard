/**
 * Messaging Connector
 * Queries iMessage and WhatsApp SQLite databases for unread message counts
 * Based on patterns from Daily Brief Skill
 */

const path = require('path')
const os = require('os')

// Use better-sqlite3 for synchronous, fast SQLite access
let Database
try {
  Database = require('better-sqlite3')
} catch (e) {
  console.warn('better-sqlite3 not available, messaging features disabled')
  Database = null
}

const HOME = os.homedir()

// Database paths
const IMESSAGE_DB_PATH = path.join(HOME, 'Library/Messages/chat.db')
const WHATSAPP_DB_PATH = path.join(HOME, 'Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite')

/**
 * Get count of unread iMessages
 * Queries the chat.db SQLite database
 */
async function getIMessageUnreadCount() {
  if (!Database) {
    return { count: null, error: 'SQLite not available' }
  }

  try {
    const db = new Database(IMESSAGE_DB_PATH, { readonly: true })
    
    // Query for unread messages (is_read = 0 and is_from_me = 0)
    // Looking at messages from the last 7 days to keep it reasonable
    const query = `
      SELECT COUNT(*) as count
      FROM message m
      JOIN chat_message_join cmj ON m.ROWID = cmj.message_id
      WHERE m.is_read = 0 
        AND m.is_from_me = 0
        AND m.date > (strftime('%s', 'now', '-7 days') - 978307200) * 1000000000
    `
    
    const result = db.prepare(query).get()
    db.close()
    
    return { count: result?.count || 0, error: null }
  } catch (error) {
    // Common error: Full Disk Access not granted
    if (error.code === 'SQLITE_CANTOPEN') {
      return { 
        count: null, 
        error: 'Cannot access Messages database. Grant Full Disk Access in System Preferences > Privacy & Security.' 
      }
    }
    return { count: null, error: error.message }
  }
}

/**
 * Get count of unread WhatsApp messages
 * Queries the WhatsApp ChatStorage.sqlite database
 */
async function getWhatsAppUnreadCount() {
  if (!Database) {
    return { count: null, error: 'SQLite not available' }
  }

  try {
    // Check if WhatsApp is installed
    const fs = require('fs')
    if (!fs.existsSync(WHATSAPP_DB_PATH)) {
      return { count: null, error: 'WhatsApp not installed or database not found' }
    }

    const db = new Database(WHATSAPP_DB_PATH, { readonly: true })
    
    // Query for unread messages in WhatsApp
    // The schema varies between versions, this is a common approach
    const query = `
      SELECT COALESCE(SUM(ZUNREADCOUNT), 0) as count
      FROM ZWACHATSESSION
      WHERE ZUNREADCOUNT > 0
    `
    
    const result = db.prepare(query).get()
    db.close()
    
    return { count: result?.count || 0, error: null }
  } catch (error) {
    if (error.code === 'SQLITE_CANTOPEN') {
      return { 
        count: null, 
        error: 'Cannot access WhatsApp database. Grant Full Disk Access in System Preferences > Privacy & Security.' 
      }
    }
    return { count: null, error: error.message }
  }
}

module.exports = {
  getIMessageUnreadCount,
  getWhatsAppUnreadCount,
  IMESSAGE_DB_PATH,
  WHATSAPP_DB_PATH
}
