# Debug Commands

Quick commands to debug inbox count issues.

## Open DevTools

While the app is running, press:
```
Cmd + Option + I
```

Or from menu: `View → Toggle Developer Tools`

## Test Individual Inboxes

Paste these commands into the DevTools Console:

### Test iMessage
```javascript
const result = await window.electronAPI.getIMessageCount()
console.log('iMessage result:', result)
```

### Test WhatsApp
```javascript
const result = await window.electronAPI.getWhatsAppCount()
console.log('WhatsApp result:', result)
```

### Test OmniFocus
```javascript
const result = await window.electronAPI.getOmniFocusInboxCount()
console.log('OmniFocus result:', result)
```

### Test Downloads
```javascript
const result = await window.electronAPI.getDownloadsCount()
console.log('Downloads result:', result)
```

### Test Desktop
```javascript
const result = await window.electronAPI.getDesktopCount()
console.log('Desktop result:', result)
```

### Test Screenshots
```javascript
const result = await window.electronAPI.getScreenshotsCount()
console.log('Screenshots result:', result)
```

### Test Browser Tabs
```javascript
const result = await window.electronAPI.getBrowserTabsCount()
console.log('Browser tabs result:', result)
```

### Test Photos
```javascript
const result = await window.electronAPI.getPhotosCount()
console.log('Photos result:', result)
```

### Test AI Chats
```javascript
const chatgpt = await window.electronAPI.getAIChatsCount('chatgpt')
const claude = await window.electronAPI.getAIChatsCount('claude')
const gemini = await window.electronAPI.getAIChatsCount('gemini')
console.log('ChatGPT:', chatgpt)
console.log('Claude:', claude)
console.log('Gemini:', gemini)
```

### Test All Inboxes
```javascript
const results = await window.electronAPI.syncAllInboxes()
console.log('All results:', results)
```

## Check Current Store State

```javascript
// Get the store (from React DevTools or direct access)
const store = window.__INBOX_STORE__
console.log('Current inboxes:', store.getState().inboxes)
```

## Force Sync

```javascript
// Force sync all inboxes
await window.electronAPI.syncAllInboxes()
console.log('Sync complete')
```

## Check Email Configuration

```javascript
const isConfigured = await window.electronAPI.isGmailConfigured()
console.log('Gmail configured:', isConfigured)
```

## Common Issues to Check

### 1. Check if electronAPI is available
```javascript
console.log('electronAPI available:', !!window.electronAPI)
console.log('electronAPI methods:', Object.keys(window.electronAPI))
```

### 2. Check for errors in results
```javascript
const result = await window.electronAPI.getIMessageCount()
if (result.error) {
  console.error('Error:', result.error)
} else {
  console.log('Count:', result.count)
}
```

### 3. Check database paths (Terminal)
```bash
# iMessage database
ls -la ~/Library/Messages/chat.db

# WhatsApp database
ls -la ~/Library/Group\ Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite

# Photos database
ls -la ~/Pictures/Photos\ Library.photoslibrary/database/Photos.sqlite
```

### 4. Test SQLite access (Terminal)
```bash
# Test iMessage database access
sqlite3 ~/Library/Messages/chat.db "SELECT COUNT(*) FROM message WHERE is_read = 0 AND is_from_me = 0"

# If you get "Error: unable to open database file"
# You need to grant Full Disk Access
```

## Expected Results

### Good Result
```javascript
{
  count: 5,
  error: null
}
```

### Error Result
```javascript
{
  count: null,
  error: "SQLITE_CANTOPEN: unable to open database file"
}
```

### Permission Error
```javascript
{
  count: null,
  error: "Full Disk Access required"
}
```

## Fix Common Errors

### "SQLITE_CANTOPEN"
**Solution:** Grant Full Disk Access
```
System Settings → Privacy & Security → Full Disk Access
→ Add Terminal.app
```

### "OmniFocus is not running"
**Solution:** Launch OmniFocus

### "automation not enabled"
**Solution:** Grant Automation permission
```
System Settings → Privacy & Security → Automation
→ Allow Terminal to control OmniFocus
```

### "Email not configured"
**Solution:** Set up email in Settings (Cmd+,)

## Monitor Real-time Updates

```javascript
// Watch for store updates
const unsubscribe = window.__INBOX_STORE__.subscribe((state) => {
  console.log('Store updated:', state.inboxes)
})

// To stop watching:
// unsubscribe()
```

## Reset Everything

If nothing works, reset:

```bash
# Stop app
pkill -f "Comprehensive Inbox Dashboard"

# Clear data
rm -rf ~/Library/Application\ Support/inbox-zero-dashboard

# Rebuild
cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
npm run electron:rebuild

# Restart
npm run electron:dev
```
