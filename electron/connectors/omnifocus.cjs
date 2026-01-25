/**
 * OmniFocus Connector
 * Uses JXA (JavaScript for Automation) to query OmniFocus 4
 * Based on patterns from Blinders/weekly-review-hud
 * 
 * Also compatible with OmniFocus-MCP patterns:
 * https://github.com/themotionmachine/OmniFocus-MCP
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs').promises
const path = require('path')
const os = require('os')

const execAsync = promisify(exec)

/**
 * Execute a JXA script via osascript
 */
async function executeJXA(script) {
  // Write script to temp file to avoid escaping issues
  const tempPath = path.join(os.tmpdir(), `omnifocus_jxa_${Date.now()}.js`)
  
  try {
    await fs.writeFile(tempPath, script, 'utf8')
    const { stdout, stderr } = await execAsync(`osascript -l JavaScript "${tempPath}"`)
    
    if (stderr) {
      console.warn('JXA stderr:', stderr)
    }
    
    return stdout.trim()
  } finally {
    // Clean up temp file
    try {
      await fs.unlink(tempPath)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get the count of items in the OmniFocus Inbox
 */
async function getInboxCount() {
  const script = `
    (function() {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      
      try {
        const doc = app.defaultDocument;
        const inboxTasks = doc.inboxTasks();
        return JSON.stringify({ count: inboxTasks.length, error: null });
      } catch (e) {
        return JSON.stringify({ count: null, error: e.message });
      }
    })();
  `

  try {
    const result = await executeJXA(script)
    return JSON.parse(result)
  } catch (error) {
    // Check if OmniFocus is not running
    if (error.message.includes('is not running') || error.message.includes('not allowed')) {
      return { count: null, error: 'OmniFocus is not running or automation not enabled' }
    }
    return { count: null, error: error.message }
  }
}

/**
 * Get flagged tasks count
 */
async function getFlaggedCount() {
  const script = `
    (function() {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      
      try {
        const doc = app.defaultDocument;
        const flaggedTasks = doc.flattenedTasks().filter(t => {
          try { return t.flagged() && !t.completed(); } 
          catch(e) { return false; }
        });
        return JSON.stringify({ count: flaggedTasks.length, error: null });
      } catch (e) {
        return JSON.stringify({ count: null, error: e.message });
      }
    })();
  `

  try {
    const result = await executeJXA(script)
    return JSON.parse(result)
  } catch (error) {
    return { count: null, error: error.message }
  }
}

/**
 * Get due today/overdue tasks count
 */
async function getDueTodayCount() {
  const script = `
    (function() {
      const app = Application('OmniFocus');
      app.includeStandardAdditions = true;
      
      try {
        const doc = app.defaultDocument;
        const now = new Date();
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
        
        const dueTasks = doc.flattenedTasks().filter(t => {
          try {
            if (t.completed()) return false;
            const due = t.dueDate();
            return due && due <= endOfDay;
          } catch(e) { return false; }
        });
        return JSON.stringify({ count: dueTasks.length, error: null });
      } catch (e) {
        return JSON.stringify({ count: null, error: e.message });
      }
    })();
  `

  try {
    const result = await executeJXA(script)
    return JSON.parse(result)
  } catch (error) {
    return { count: null, error: error.message }
  }
}

module.exports = {
  getInboxCount,
  getFlaggedCount,
  getDueTodayCount,
  executeJXA
}
