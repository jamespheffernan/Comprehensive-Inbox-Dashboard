/**
 * Photos Connector
 * Queries macOS Photos app for recent/unprocessed photos
 * Uses JXA (JavaScript for Automation) or direct SQLite access
 */

const { exec } = require('child_process')
const { promisify } = require('util')
const fs = require('fs')
const path = require('path')
const os = require('os')

const execAsync = promisify(exec)

const HOME = os.homedir()

// Photos library database paths
const PHOTOS_LIBRARY_PATH = path.join(HOME, 'Pictures/Photos Library.photoslibrary')
const PHOTOS_DB_PATH = path.join(PHOTOS_LIBRARY_PATH, 'database/Photos.sqlite')

/**
 * Execute a JXA script via osascript
 */
async function executeJXA(script) {
  const tempPath = path.join(os.tmpdir(), `photos_jxa_${Date.now()}.js`)
  
  try {
    const fsPromises = require('fs').promises
    await fsPromises.writeFile(tempPath, script, 'utf8')
    const { stdout, stderr } = await execAsync(`osascript -l JavaScript "${tempPath}"`)
    
    if (stderr) {
      console.warn('JXA stderr:', stderr)
    }
    
    return stdout.trim()
  } finally {
    try {
      const fsPromises = require('fs').promises
      await fsPromises.unlink(tempPath)
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Get count of recent photos (last 24 hours) using JXA
 * This is a proxy for "unprocessed" photos that need to be organized
 */
async function getRecentPhotosCount() {
  // First, try using JXA with Photos app
  const script = `
    (function() {
      const photos = Application('Photos');
      photos.includeStandardAdditions = true;
      
      try {
        // Get the "Recents" album or all photos from last 24 hours
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        // Try to get "Imports" album first (most relevant for "inbox")
        const albums = photos.albums();
        let targetAlbum = null;
        
        for (let i = 0; i < albums.length; i++) {
          const name = albums[i].name();
          if (name === 'Imports' || name === 'Recents' || name === 'Last Import') {
            targetAlbum = albums[i];
            break;
          }
        }
        
        if (targetAlbum) {
          const items = targetAlbum.mediaItems();
          // Count items from last 24 hours
          let count = 0;
          for (let i = 0; i < Math.min(items.length, 100); i++) {
            try {
              const date = items[i].date();
              if (date >= oneDayAgo) count++;
            } catch(e) {}
          }
          return JSON.stringify({ count: count, error: null, album: targetAlbum.name() });
        }
        
        // Fallback: count recent items from all photos
        const allPhotos = photos.mediaItems();
        let count = 0;
        for (let i = 0; i < Math.min(allPhotos.length, 100); i++) {
          try {
            const date = allPhotos[i].date();
            if (date >= oneDayAgo) count++;
          } catch(e) {}
        }
        
        return JSON.stringify({ count: count, error: null, album: 'All Photos (recent)' });
      } catch (e) {
        return JSON.stringify({ count: null, error: e.message });
      }
    })();
  `

  try {
    const result = await executeJXA(script)
    return JSON.parse(result)
  } catch (error) {
    // If JXA fails, try direct SQLite access (requires Full Disk Access)
    return await getRecentPhotosCountFromSQLite()
  }
}

/**
 * Fallback: Get recent photos count from SQLite database
 */
async function getRecentPhotosCountFromSQLite() {
  let Database
  try {
    Database = require('better-sqlite3')
  } catch (e) {
    return { count: null, error: 'Cannot access Photos: SQLite library not available' }
  }

  try {
    if (!fs.existsSync(PHOTOS_DB_PATH)) {
      return { count: null, error: 'Photos library not found at default location' }
    }

    const db = new Database(PHOTOS_DB_PATH, { readonly: true })
    
    // Query for photos from the last 24 hours
    // Note: Photos uses Core Data timestamps (seconds since 2001-01-01)
    const query = `
      SELECT COUNT(*) as count
      FROM ZASSET
      WHERE ZDATECREATED > (strftime('%s', 'now', '-1 day') - 978307200)
        AND ZTRASHEDSTATE = 0
    `
    
    const result = db.prepare(query).get()
    db.close()
    
    return { count: result?.count || 0, error: null }
  } catch (error) {
    if (error.code === 'SQLITE_CANTOPEN') {
      return { 
        count: null, 
        error: 'Cannot access Photos database. Grant Full Disk Access in System Preferences > Privacy & Security.' 
      }
    }
    return { count: null, error: error.message }
  }
}

/**
 * Get the "Imports" album count specifically
 */
async function getImportsCount() {
  const script = `
    (function() {
      const photos = Application('Photos');
      
      try {
        const albums = photos.albums();
        for (let i = 0; i < albums.length; i++) {
          if (albums[i].name() === 'Imports') {
            return JSON.stringify({ count: albums[i].mediaItems().length, error: null });
          }
        }
        return JSON.stringify({ count: 0, error: 'Imports album not found' });
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
  getRecentPhotosCount,
  getRecentPhotosCountFromSQLite,
  getImportsCount,
  PHOTOS_LIBRARY_PATH
}
