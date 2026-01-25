/**
 * Browser Connector
 * Counts open tabs in Comet browser (by Perplexity) and other browsers
 * Uses AppleScript/JXA for macOS browser automation
 */

const { exec } = require('child_process')
const { promisify } = require('util')

const execAsync = promisify(exec)

/**
 * Execute AppleScript
 */
async function executeAppleScript(script) {
  try {
    const { stdout } = await execAsync(`osascript -e '${script.replace(/'/g, "'\"'\"'")}'`)
    return stdout.trim()
  } catch (error) {
    throw error
  }
}

/**
 * Get tab count from Comet browser
 * Comet is based on Chromium, may support AppleScript like Chrome
 */
async function getCometTabsCount() {
  // Try different application names that Comet might use
  const possibleNames = ['Comet', 'Perplexity', 'Comet Browser']
  
  for (const appName of possibleNames) {
    try {
      // Check if the app is running first
      const checkScript = `
        tell application "System Events"
          set isRunning to (name of processes) contains "${appName}"
        end tell
        return isRunning
      `
      const isRunning = await executeAppleScript(checkScript)
      
      if (isRunning === 'true') {
        // Try to get tab count
        const countScript = `
          tell application "${appName}"
            set tabCount to 0
            repeat with w in windows
              set tabCount to tabCount + (count of tabs of w)
            end repeat
            return tabCount
          end tell
        `
        const count = await executeAppleScript(countScript)
        return { count: parseInt(count, 10) || 0, error: null, browser: appName }
      }
    } catch (e) {
      // This app name didn't work, try next
      continue
    }
  }

  // If Comet doesn't support AppleScript, return manual tracking mode
  return { 
    count: null, 
    error: 'Comet browser not found or does not support AppleScript. Use manual tracking.',
    manual: true 
  }
}

/**
 * Get tab count from Safari
 */
async function getSafariTabsCount() {
  try {
    const script = `
      tell application "Safari"
        set tabCount to 0
        repeat with w in windows
          set tabCount to tabCount + (count of tabs of w)
        end repeat
        return tabCount
      end tell
    `
    const count = await executeAppleScript(script)
    return { count: parseInt(count, 10) || 0, error: null, browser: 'Safari' }
  } catch (error) {
    if (error.message.includes('not running')) {
      return { count: 0, error: null, browser: 'Safari' }
    }
    return { count: null, error: error.message, browser: 'Safari' }
  }
}

/**
 * Get tab count from Chrome
 */
async function getChromeTabsCount() {
  try {
    const script = `
      tell application "Google Chrome"
        set tabCount to 0
        repeat with w in windows
          set tabCount to tabCount + (count of tabs of w)
        end repeat
        return tabCount
      end tell
    `
    const count = await executeAppleScript(script)
    return { count: parseInt(count, 10) || 0, error: null, browser: 'Chrome' }
  } catch (error) {
    if (error.message.includes('not running')) {
      return { count: 0, error: null, browser: 'Chrome' }
    }
    return { count: null, error: error.message, browser: 'Chrome' }
  }
}

/**
 * Get tab count from Arc
 */
async function getArcTabsCount() {
  try {
    const script = `
      tell application "Arc"
        set tabCount to 0
        repeat with w in windows
          set tabCount to tabCount + (count of tabs of w)
        end repeat
        return tabCount
      end tell
    `
    const count = await executeAppleScript(script)
    return { count: parseInt(count, 10) || 0, error: null, browser: 'Arc' }
  } catch (error) {
    if (error.message.includes('not running')) {
      return { count: 0, error: null, browser: 'Arc' }
    }
    return { count: null, error: error.message, browser: 'Arc' }
  }
}

/**
 * Get tab counts from all browsers
 */
async function getAllBrowserTabsCount() {
  const results = await Promise.allSettled([
    getCometTabsCount(),
    getSafariTabsCount(),
    getChromeTabsCount(),
    getArcTabsCount()
  ])

  const browsers = {}
  let totalCount = 0

  const names = ['comet', 'safari', 'chrome', 'arc']
  results.forEach((result, index) => {
    if (result.status === 'fulfilled' && result.value.count !== null) {
      browsers[names[index]] = result.value
      totalCount += result.value.count
    } else {
      browsers[names[index]] = result.value || { count: null, error: result.reason?.message }
    }
  })

  return { 
    totalCount, 
    browsers,
    error: null 
  }
}

module.exports = {
  getCometTabsCount,
  getSafariTabsCount,
  getChromeTabsCount,
  getArcTabsCount,
  getAllBrowserTabsCount
}
