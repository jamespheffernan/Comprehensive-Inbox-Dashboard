# Troubleshooting Guide

Common issues and how to fix them.

## 🔴 Wrong Inbox Counts

### Issue: Counts show incorrect numbers or don't update

**Possible Causes:**

1. **Permissions not granted**
   - iMessage/WhatsApp need Full Disk Access
   - OmniFocus/Photos need Automation permission
   
2. **Apps not running**
   - OmniFocus must be running for count to work
   - Browser must be open for tab counts
   
3. **Database paths wrong**
   - Check console (Cmd+Option+I) for path errors
   - Verify databases exist at expected locations

**Solutions:**

1. **Check DevTools Console:**
   ```
   View → Toggle Developer Tools
   ```
   Look for error messages in red

2. **Verify Full Disk Access:**
   ```
   System Settings → Privacy & Security → Full Disk Access
   → Add Terminal.app or the built app
   ```

3. **Test Individual Connectors:**
   Open DevTools and run:
   ```javascript
   // Test iMessage
   await window.electronAPI.getIMessageCount()
   
   // Test WhatsApp
   await window.electronAPI.getWhatsAppCount()
   
   // Test OmniFocus
   await window.electronAPI.getOmniFocusInboxCount()
   ```

4. **Check Database Locations:**
   ```bash
   # iMessage
   ls -la ~/Library/Messages/chat.db
   
   # WhatsApp
   ls -la ~/Library/Group\ Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite
   ```

### Issue: iMessage/WhatsApp show "Tap to clear" instead of counts

**Cause:** `better-sqlite3` module not properly built for Electron

**Solution:**
```bash
cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
npm run electron:rebuild
npm run electron:dev
```

### Issue: Counts are stuck/not updating

**Solutions:**

1. **Manual Sync:**
   - Press `Cmd+R` to force sync
   - Or click the refresh button

2. **Restart App:**
   - Quit (Cmd+Q) and relaunch

3. **Clear Cache:**
   ```bash
   rm -rf ~/Library/Application\ Support/inbox-zero-dashboard
   ```

## 📧 Email Not Working

### Issue: Email shows "Tap to clear" or error message

**Cause:** Email integration requires setup

**Solutions:**

### For Gmail:

1. **Create OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create project → Enable Gmail API
   - Create OAuth 2.0 Client ID (Desktop app)
   - Download JSON

2. **Install Credentials:**
   ```bash
   mkdir -p ~/.inbox-zero-dashboard
   cp ~/Downloads/client_secret_*.json ~/.inbox-zero-dashboard/gmail-credentials.json
   ```

3. **Authenticate in App:**
   - Press Cmd+, (Settings)
   - Go to Email Setup
   - Click "Authenticate with Gmail"
   - Follow OAuth flow

### For iCloud Mail:

1. **Generate App Password:**
   - Visit [appleid.apple.com](https://appleid.apple.com/)
   - Security → App-Specific Passwords
   - Generate new password

2. **Configure in App:**
   - Press Cmd+, (Settings)
   - Go to Email Setup
   - Enter iCloud email
   - Paste app-specific password
   - Save

### Issue: Gmail shows "not configured"

**Check:**
```bash
# Verify credentials file exists
ls -la ~/.inbox-zero-dashboard/gmail-credentials.json

# Check contents (should be valid JSON)
cat ~/.inbox-zero-dashboard/gmail-credentials.json
```

### Issue: iCloud Mail connection fails

**Common Causes:**
- Wrong email address
- Using main password instead of app-specific password
- Network/firewall blocking IMAP (port 993)

**Solution:**
- Double-check email is correct
- Generate NEW app-specific password
- Test IMAP connection:
  ```bash
  telnet imap.mail.me.com 993
  ```

## 🤖 AI Chats Not Working

### Issue: AI chats show error or zero count

**Cause:** AI Chat Importer not set up or index file missing

**Solutions:**

1. **Verify AI Chat Importer:**
   ```bash
   cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats
   ls -la conversation-index.json
   ```

2. **Run AI Chat Importer:**
   ```bash
   cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats
   npm run export
   ```

3. **Check Index File:**
   ```bash
   cat ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats/conversation-index.json | jq .
   ```

### Issue: Counts don't match actual conversations

**Cause:** Index hasn't been updated recently

**Solution:**
```bash
cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats
npm run export  # Re-export conversations
```

## ✅ OmniFocus Not Working

### Issue: Shows "OmniFocus is not running"

**Solution:** Launch OmniFocus

### Issue: Shows "automation not enabled"

**Solutions:**

1. **Enable in OmniFocus:**
   - OmniFocus → Settings → Automation
   - Enable automation

2. **Grant macOS Permission:**
   - System Settings → Privacy & Security → Automation
   - Allow Terminal/App to control OmniFocus

### Issue: Count is wrong

**Possible Causes:**
- Deferred tasks in inbox
- Filtered view in OmniFocus

**Solution:**
- Check OmniFocus inbox directly
- Ensure no filters are applied
- Restart OmniFocus

## 📁 File System Counts Wrong

### Issue: Downloads/Desktop counts don't match

**Common Causes:**
- Hidden files being counted/not counted
- Subdirectories being counted
- `.DS_Store` and system files

**Current Behavior:**
- Counts visible files only (not hidden)
- Counts top-level items only (not recursive)
- Ignores `.DS_Store`, `.localized`, etc.

**To Debug:**
```bash
# Count visible files in Downloads
ls -1 ~/Downloads | wc -l

# Count visible files in Desktop
ls -1 ~/Desktop | wc -l
```

### Issue: Screenshots count wrong

**Possible Causes:**
- Screenshots in different location
- Different naming pattern

**Check Screenshot Location:**
```bash
# Default location
ls -la ~/Desktop/Screenshot*.png

# Alternative location
ls -la ~/Pictures/Screenshots/
```

## 🌐 Browser Tabs Not Working

### Issue: Shows "manual tracking" or error

**Cause:** Browser doesn't support AppleScript

**Supported Browsers:**
- Safari ✅
- Chrome ✅
- Arc ✅
- Comet ⚠️ (may not support AppleScript)

**Solutions:**

1. **For Comet:**
   - Use manual mode
   - Click card to open browser
   - Click "Mark as cleared" when done

2. **For Other Browsers:**
   - Grant Automation permission when prompted
   - Ensure browser is running

### Issue: Count is zero but tabs are open

**Causes:**
- Browser not running
- Automation permission not granted
- Browser windows minimized

**Solution:**
- Make sure browser is running
- Grant automation permission
- Bring browser to foreground

## 📸 Photos Not Working

### Issue: Shows error or wrong count

**Solutions:**

1. **Grant Automation Permission:**
   - System Settings → Privacy & Security → Automation
   - Allow app to control Photos

2. **Alternative: Grant Full Disk Access:**
   - If JXA fails, app falls back to SQLite
   - Requires Full Disk Access

3. **Check Photos Library:**
   ```bash
   ls -la ~/Pictures/Photos\ Library.photoslibrary/database/Photos.sqlite
   ```

## 🔔 Notifications Not Working

### Issue: No notifications when inboxes are due

**Solutions:**

1. **Grant Notification Permission:**
   - System Settings → Notifications
   - Find "Inbox Zero Dashboard"
   - Enable notifications

2. **Check Settings:**
   - Press Cmd+, (Settings)
   - Go to Notifications tab
   - Ensure notifications are enabled

3. **Test Notification:**
   - Open DevTools (Cmd+Option+I)
   - Run:
     ```javascript
     await window.electronAPI.showNotification('Test', 'This is a test notification')
     ```

## ⏱️ Timers Not Working

### Issue: Timer doesn't start after clearing

**Solution:**
- Refresh the app (Cmd+R)
- Check DevTools console for errors

### Issue: Timer resets unexpectedly

**Cause:** State persistence issue

**Solution:**
```bash
# Clear app data
rm -rf ~/Library/Application\ Support/inbox-zero-dashboard

# Restart app
```

### Issue: Timer shows wrong time

**Cause:** System clock incorrect or timezone issue

**Solution:**
- Check system time is correct
- Restart app

## 🎨 UI Issues

### Issue: Theme not applying

**Solution:**
- Press Cmd+, → Appearance
- Select theme again
- Restart app if needed

### Issue: Cards not displaying correctly

**Solution:**
- Zoom reset: Cmd+0
- Restart app
- Clear cache and restart

## 🐛 General Debugging

### Enable Verbose Logging

Open DevTools (Cmd+Option+I) and check Console tab for errors.

### Check Electron Logs

```bash
# View main process logs
tail -f ~/Library/Logs/inbox-zero-dashboard/main.log

# View renderer logs
# Already visible in DevTools Console
```

### Test IPC Communication

In DevTools Console:
```javascript
// Test if Electron API is available
console.log(window.electronAPI)

// Test sync
await window.electronAPI.syncAllInboxes()

// Test individual inbox
await window.electronAPI.getIMessageCount()
```

### Reset Everything

```bash
# Stop app
pkill -f "Comprehensive Inbox Dashboard"

# Clear all data
rm -rf ~/Library/Application\ Support/inbox-zero-dashboard
rm -rf ~/.inbox-zero-dashboard

# Rebuild native modules
cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
npm run electron:rebuild

# Restart
npm run electron:dev
```

## 📞 Still Having Issues?

1. **Check Console Logs:**
   - Open DevTools (Cmd+Option+I)
   - Look for red error messages
   - Copy the error text

2. **Check File Permissions:**
   ```bash
   # Verify Full Disk Access
   sqlite3 ~/Library/Messages/chat.db "SELECT COUNT(*) FROM message" 2>&1
   ```

3. **Verify Installation:**
   ```bash
   cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
   npm list better-sqlite3
   npm list electron
   ```

4. **Create Issue:**
   - Include macOS version
   - Include error messages from console
   - Include steps to reproduce
   - Include output of verification commands above
