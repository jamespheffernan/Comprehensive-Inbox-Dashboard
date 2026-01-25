/**
 * File System Connector
 * Watches and counts files in Downloads, Desktop, and Screenshots folders
 * Uses chokidar for efficient file watching
 */

const fs = require('fs')
const path = require('path')
const os = require('os')

let chokidar
try {
  chokidar = require('chokidar')
} catch (e) {
  console.warn('chokidar not available, file watching disabled')
  chokidar = null
}

const HOME = os.homedir()

// Default paths - can be customized
const PATHS = {
  downloads: path.join(HOME, 'Downloads'),
  desktop: path.join(HOME, 'Desktop'),
  // Screenshots can be in different locations
  screenshots: [
    path.join(HOME, 'Desktop'), // Default macOS location
    path.join(HOME, 'Pictures/Screenshots'),
    path.join(HOME, 'Library/Mobile Documents/com~apple~CloudDocs/Screenshots'),
  ]
}

// File watchers
const watchers = {}

// Cached counts
const counts = {
  downloads: 0,
  desktop: 0,
  screenshots: 0
}

/**
 * Count non-hidden files in a directory (non-recursive)
 */
function countFilesInDirectory(dirPath) {
  try {
    if (!fs.existsSync(dirPath)) {
      return 0
    }
    
    const items = fs.readdirSync(dirPath)
    return items.filter(item => {
      // Skip hidden files (starting with .)
      if (item.startsWith('.')) return false
      // Skip .DS_Store and other system files
      if (item === '.DS_Store' || item === '.localized') return false
      
      const fullPath = path.join(dirPath, item)
      try {
        const stat = fs.statSync(fullPath)
        // Count both files and folders as items to process
        return stat.isFile() || stat.isDirectory()
      } catch (e) {
        return false
      }
    }).length
  } catch (error) {
    console.error(`Error counting files in ${dirPath}:`, error)
    return 0
  }
}

/**
 * Count screenshot files
 * Screenshots are typically PNG files on macOS
 */
function countScreenshots() {
  let total = 0
  
  for (const screenshotPath of PATHS.screenshots) {
    if (!fs.existsSync(screenshotPath)) continue
    
    try {
      const items = fs.readdirSync(screenshotPath)
      const screenshots = items.filter(item => {
        // macOS screenshot naming pattern: "Screenshot YYYY-MM-DD at HH.MM.SS.png"
        // or "Screen Shot YYYY-MM-DD at HH.MM.SS.png" (older versions)
        const isScreenshot = item.startsWith('Screenshot') || item.startsWith('Screen Shot')
        const isPng = item.toLowerCase().endsWith('.png')
        return isScreenshot && isPng
      })
      total += screenshots.length
    } catch (e) {
      // Skip inaccessible directories
    }
  }
  
  return total
}

/**
 * Initialize file watchers for real-time updates
 */
function initWatchers() {
  if (!chokidar) return

  // Watch Downloads
  if (fs.existsSync(PATHS.downloads)) {
    watchers.downloads = chokidar.watch(PATHS.downloads, {
      depth: 0,
      ignoreInitial: true,
      ignored: /(^|[\/\\])\./
    })
    watchers.downloads.on('all', () => {
      counts.downloads = countFilesInDirectory(PATHS.downloads)
    })
  }

  // Watch Desktop
  if (fs.existsSync(PATHS.desktop)) {
    watchers.desktop = chokidar.watch(PATHS.desktop, {
      depth: 0,
      ignoreInitial: true,
      ignored: /(^|[\/\\])\./
    })
    watchers.desktop.on('all', () => {
      counts.desktop = countFilesInDirectory(PATHS.desktop)
    })
  }

  // Watch Screenshot locations
  for (const screenshotPath of PATHS.screenshots) {
    if (fs.existsSync(screenshotPath)) {
      const key = `screenshots_${screenshotPath.replace(/\//g, '_')}`
      watchers[key] = chokidar.watch(screenshotPath, {
        depth: 0,
        ignoreInitial: true,
        ignored: /(^|[\/\\])\./
      })
      watchers[key].on('all', () => {
        counts.screenshots = countScreenshots()
      })
    }
  }

  // Initial counts
  counts.downloads = countFilesInDirectory(PATHS.downloads)
  counts.desktop = countFilesInDirectory(PATHS.desktop)
  counts.screenshots = countScreenshots()
}

/**
 * Stop all file watchers
 */
function stopWatchers() {
  for (const key in watchers) {
    if (watchers[key]) {
      watchers[key].close()
    }
  }
}

/**
 * Get Downloads count
 */
async function getDownloadsCount() {
  const count = countFilesInDirectory(PATHS.downloads)
  counts.downloads = count
  return { count, error: null, path: PATHS.downloads }
}

/**
 * Get Desktop count
 */
async function getDesktopCount() {
  const count = countFilesInDirectory(PATHS.desktop)
  counts.desktop = count
  return { count, error: null, path: PATHS.desktop }
}

/**
 * Get Screenshots count
 */
async function getScreenshotsCount() {
  const count = countScreenshots()
  counts.screenshots = count
  
  // Find which path has screenshots
  let activePath = PATHS.screenshots[0]
  for (const p of PATHS.screenshots) {
    if (fs.existsSync(p)) {
      activePath = p
      break
    }
  }
  
  return { count, error: null, path: activePath }
}

module.exports = {
  initWatchers,
  stopWatchers,
  getDownloadsCount,
  getDesktopCount,
  getScreenshotsCount,
  PATHS
}
