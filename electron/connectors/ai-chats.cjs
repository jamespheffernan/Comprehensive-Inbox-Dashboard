/**
 * AI Chats Connector
 * Integrates with the existing Inbox Importer AI Chats project
 * Reads from conversation-index.json to track new/unprocessed conversations
 * 
 * Reference: /Users/jamesheffernan/Documents/GitHub/Inbox Importer AI Chats
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

// Path to the AI Chat Importer project
const AI_CHAT_IMPORTER_PATH = path.join(
  os.homedir(), 
  'Documents/GitHub/Inbox Importer AI Chats'
)
const CONVERSATION_INDEX_PATH = path.join(AI_CHAT_IMPORTER_PATH, 'conversation-index.json')

// Track when user last "zeroed" each AI chat inbox
// This is stored in the app's own state, not the importer's index
let lastZeroedAt = {
  chatgpt: null,
  claude: null,
  gemini: null
}

/**
 * Load the conversation index from the AI Chat Importer
 */
function loadConversationIndex() {
  try {
    if (!fs.existsSync(CONVERSATION_INDEX_PATH)) {
      return null
    }
    
    const data = fs.readFileSync(CONVERSATION_INDEX_PATH, 'utf8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error loading conversation index:', error)
    return null
  }
}

/**
 * Get count of new conversations for a specific AI chat source
 * "New" means conversations added since the user last marked this inbox as zero
 */
async function getNewConversationsCount(source) {
  const validSources = ['chatgpt', 'claude', 'gemini']
  if (!validSources.includes(source)) {
    return { count: null, error: `Invalid source: ${source}. Must be one of: ${validSources.join(', ')}` }
  }

  const index = loadConversationIndex()
  
  if (!index) {
    return { 
      count: null, 
      error: 'AI Chat Importer not configured. Run: cd ~/Documents/GitHub/Inbox\\ Importer\\ AI\\ Chats && npm run setup' 
    }
  }

  const conversations = Object.values(index.conversations || {})
  const sourceConversations = conversations.filter(c => c.source === source)
  
  // If we have a lastZeroedAt timestamp, count only conversations after that
  const lastZeroed = lastZeroedAt[source]
  
  let count = 0
  if (lastZeroed) {
    count = sourceConversations.filter(c => {
      const firstSeen = new Date(c.first_seen)
      return firstSeen > lastZeroed
    }).length
  } else {
    // If never zeroed, count all as "new" initially
    // But for a better UX, we'll count conversations from the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000)
    count = sourceConversations.filter(c => {
      const firstSeen = new Date(c.first_seen)
      return firstSeen > oneDayAgo
    }).length
  }

  return { 
    count, 
    error: null,
    total: sourceConversations.length,
    lastUpdated: index.last_updated
  }
}

/**
 * Get counts for all AI chat sources
 */
async function getAllAIChatsCount() {
  const index = loadConversationIndex()
  
  if (!index) {
    return { 
      error: 'AI Chat Importer not configured',
      chatgpt: { count: null },
      claude: { count: null },
      gemini: { count: null }
    }
  }

  const results = await Promise.all([
    getNewConversationsCount('chatgpt'),
    getNewConversationsCount('claude'),
    getNewConversationsCount('gemini')
  ])

  return {
    chatgpt: results[0],
    claude: results[1],
    gemini: results[2],
    lastUpdated: index.last_updated,
    error: null
  }
}

/**
 * Mark an AI chat source as "zeroed" (processed to inbox zero)
 */
function markAsZeroed(source) {
  if (['chatgpt', 'claude', 'gemini'].includes(source)) {
    lastZeroedAt[source] = new Date()
    return { success: true, zeroedAt: lastZeroedAt[source] }
  }
  return { success: false, error: 'Invalid source' }
}

/**
 * Get the last zeroed timestamp for a source
 */
function getLastZeroedAt(source) {
  return lastZeroedAt[source]
}

/**
 * Set last zeroed timestamps (for restoring from persisted state)
 */
function setLastZeroedAt(timestamps) {
  lastZeroedAt = { ...lastZeroedAt, ...timestamps }
}

/**
 * Get deep link URL for an AI chat service
 */
function getDeepLink(source) {
  const links = {
    chatgpt: 'https://chatgpt.com/',
    claude: 'https://claude.ai/',
    gemini: 'https://gemini.google.com/app'
  }
  return links[source] || null
}

module.exports = {
  getNewConversationsCount,
  getAllAIChatsCount,
  markAsZeroed,
  getLastZeroedAt,
  setLastZeroedAt,
  getDeepLink,
  AI_CHAT_IMPORTER_PATH,
  CONVERSATION_INDEX_PATH
}
