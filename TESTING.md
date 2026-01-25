# Testing Guide

How to test each integration and feature of the Inbox Zero Dashboard.

## 🧪 Testing Checklist

### Initial Setup

- [ ] App launches without errors
- [ ] Dashboard displays with all inbox cards
- [ ] DevTools show no console errors
- [ ] Window is properly sized and positioned

### iMessage Integration

**Prerequisites:**
- Full Disk Access granted
- Have some unread iMessages

**Test Steps:**
1. Send yourself an iMessage from another device
2. Wait for sync (or click refresh)
3. Verify count increases
4. Mark message as read in Messages app
5. Wait for sync
6. Verify count decreases

**Expected Results:**
- Count reflects actual unread messages
- Updates within 60 seconds (or immediately on manual sync)
- Error message if Full Disk Access not granted

### WhatsApp Integration

**Prerequisites:**
- WhatsApp installed and logged in
- Full Disk Access granted

**Test Steps:**
1. Have someone send you a WhatsApp message
2. Wait for sync
3. Verify count shows in dashboard
4. Open WhatsApp and read message
5. Wait for sync
6. Verify count decreases

**Expected Results:**
- Aggregates unread across all chats
- Shows "WhatsApp not installed" if app missing
- Prompts for Full Disk Access if needed

### OmniFocus Integration

**Prerequisites:**
- OmniFocus 4 Pro installed and running
- Automation permission granted

**Test Steps:**
1. Add items to OmniFocus inbox
2. Wait for sync
3. Verify count matches OmniFocus
4. Click the card
5. Verify OmniFocus opens to inbox
6. Clear inbox in OmniFocus
7. Wait for sync
8. Verify dashboard shows 0

**Expected Results:**
- Count matches OmniFocus exactly
- Deep link opens OmniFocus inbox
- Shows error if OmniFocus not running

### File System Integration

**Test Downloads:**
1. Download a file
2. Verify count increases immediately
3. Move file out of Downloads
4. Verify count decreases immediately

**Test Desktop:**
1. Create a file on Desktop
2. Verify count increases
3. Delete file
4. Verify count decreases

**Test Screenshots:**
1. Take a screenshot (Cmd+Shift+4)
2. Verify Screenshots count increases
3. Delete screenshot
4. Verify count decreases

**Expected Results:**
- Real-time updates (no delay)
- Ignores hidden files
- Counts both files and folders

### Browser Tabs Integration

**Test with Safari:**
1. Open Safari with multiple tabs
2. Wait for sync
3. Verify count matches tab count
4. Close some tabs
5. Wait for sync
6. Verify count decreases

**Test with Comet:**
1. Open Comet browser
2. Wait for sync
3. Check if count appears or shows "manual"
4. If manual, click card to open Comet
5. Click "Mark as cleared"
6. Verify timer starts

**Expected Results:**
- Counts tabs across all windows
- Returns 0 if browser not running
- Falls back to manual if AppleScript not supported

### AI Chats Integration

**Prerequisites:**
- AI Chat Importer set up
- `conversation-index.json` exists

**Test Steps:**
1. Have a conversation in ChatGPT
2. Run AI Chat Importer: `cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats && npm run export`
3. Wait for dashboard sync
4. Verify ChatGPT count increases
5. Click the ChatGPT card
6. Verify browser opens to ChatGPT
7. Click "Mark as cleared"
8. Verify timer starts and count resets

**Expected Results:**
- Counts new conversations since last zero
- Deep links open correct service
- Shows error if AI Chat Importer not set up

### Photos Integration

**Test Steps:**
1. Import some photos to Photos app
2. Wait for sync
3. Verify count shows recent photos
4. Click the card
5. Verify Photos app opens
6. After 24 hours, count should decrease

**Expected Results:**
- Counts photos from last 24 hours
- Prefers "Imports" album if exists
- Falls back to SQLite if JXA fails

### Email Integration

**Test Gmail:**
1. Add Gmail credentials
2. Click "Authenticate with Gmail"
3. Complete OAuth flow
4. Wait for sync
5. Verify unread count appears
6. Mark email as read in Gmail
7. Wait for sync
8. Verify count decreases

**Test iCloud:**
1. Add iCloud email and app password
2. Click "Save iCloud Settings"
3. Wait for sync
4. Verify unread count appears

**Expected Results:**
- OAuth flow completes successfully
- Counts update within 60 seconds
- Shows helpful error messages

### Physical Inboxes

**Test Steps:**
1. Find a physical inbox card (e.g., "Physical Mailbox")
2. Click "Tap to clear"
3. Verify timer starts
4. Verify state changes to green
5. Wait 12 hours (or modify timer threshold)
6. Verify state changes to orange (warning)
7. Wait 24 hours total
8. Verify state changes to red (due)
9. Verify notification appears

**Expected Results:**
- Manual clearing works instantly
- Timer persists across restarts
- Notifications trigger at 24h

### Timer System

**Test Timer States:**
1. Clear an inbox to zero
2. Verify shows "Just cleared"
3. Wait 1 minute
4. Verify shows "1m since ∅"
5. Wait 1 hour
6. Verify shows "1h since ∅"
7. Wait 12 hours
8. Verify card border turns orange
9. Wait 24 hours
10. Verify card border turns red
11. Verify notification appears

**Test Timer Persistence:**
1. Clear an inbox
2. Quit the app (Cmd+Q)
3. Relaunch the app
4. Verify timer continues from where it left off

**Expected Results:**
- Timers count up continuously
- State colors match thresholds
- Persist across restarts

### Notifications

**Test Steps:**
1. Clear an inbox
2. Wait 24 hours (or modify threshold for testing)
3. Verify desktop notification appears
4. Verify notification shows correct inbox name
5. Clear the inbox
6. Wait another 24 hours
7. Verify notification appears again

**Expected Results:**
- One notification per inbox per due period
- Notifications respect system settings
- Can be disabled in Settings

### Settings Modal

**Test Themes:**
1. Open Settings (Cmd+,)
2. Go to Appearance tab
3. Click each theme
4. Verify colors change immediately
5. Close and reopen app
6. Verify theme persists

**Test Notifications:**
1. Go to Notifications tab
2. Toggle notification settings
3. Verify changes take effect

**Test Email Setup:**
1. Go to Email Setup tab
2. Follow Gmail setup instructions
3. Follow iCloud setup instructions
4. Verify credentials are saved

**Expected Results:**
- Theme changes apply immediately
- Settings persist across restarts
- Clear instructions provided

### Keyboard Shortcuts

**Test Each Shortcut:**
- [ ] Cmd+R - Syncs all inboxes
- [ ] Cmd+, - Opens settings
- [ ] Cmd+/ - Opens help
- [ ] Cmd+Q - Quits app
- [ ] Cmd+W - Closes window
- [ ] Cmd+M - Minimizes window

**Expected Results:**
- All shortcuts work as documented
- No conflicts with system shortcuts

### Help Overlay

**Test Steps:**
1. Press Cmd+/ or click help button
2. Verify overlay opens
3. Read through all sections
4. Verify keyboard shortcuts listed
5. Verify tips are helpful
6. Close overlay

**Expected Results:**
- Clear, helpful information
- All shortcuts documented
- Easy to understand

### Performance

**Test Sync Performance:**
1. Click refresh button
2. Time how long sync takes
3. Should complete in < 1 second

**Test Memory Usage:**
1. Open Activity Monitor
2. Find "Electron" process
3. Verify memory < 200MB

**Test CPU Usage:**
1. Let app idle for 5 minutes
2. Check CPU usage in Activity Monitor
3. Should be < 1% when idle

**Expected Results:**
- Fast sync times
- Low memory footprint
- Minimal CPU usage

### Error Handling

**Test Permission Errors:**
1. Revoke Full Disk Access
2. Wait for sync
3. Verify helpful error message
4. Grant permission
5. Verify recovery

**Test Missing Apps:**
1. Quit OmniFocus
2. Wait for sync
3. Verify error message
4. Launch OmniFocus
5. Wait for sync
6. Verify recovery

**Test Network Errors:**
1. Disconnect from internet
2. Try Gmail sync
3. Verify error message
4. Reconnect
5. Verify recovery

**Expected Results:**
- Clear, actionable error messages
- Graceful degradation
- Auto-recovery when possible

### Cross-Platform (if applicable)

**Test on Different Macs:**
- [ ] MacBook (laptop)
- [ ] Mac mini (desktop)
- [ ] Different macOS versions

**Expected Results:**
- Works consistently across devices
- Paths adapt to user's home directory

## 🐛 Known Issues

Document any issues found during testing:

1. **Issue:** [Description]
   - **Severity:** Low/Medium/High
   - **Workaround:** [If any]
   - **Status:** Open/Fixed

## 📊 Test Results Template

```
Date: YYYY-MM-DD
Tester: [Name]
macOS Version: [Version]
App Version: [Version]

| Feature | Status | Notes |
|---------|--------|-------|
| iMessage | ✅/❌ | |
| WhatsApp | ✅/❌ | |
| OmniFocus | ✅/❌ | |
| Files | ✅/❌ | |
| Browser | ✅/❌ | |
| AI Chats | ✅/❌ | |
| Photos | ✅/❌ | |
| Email | ✅/❌ | |
| Physical | ✅/❌ | |
| Timers | ✅/❌ | |
| Notifications | ✅/❌ | |
| Settings | ✅/❌ | |
| Shortcuts | ✅/❌ | |
| Help | ✅/❌ | |
| Performance | ✅/❌ | |
```

## 🔄 Regression Testing

Before each release, run through this checklist to ensure no regressions:

- [ ] All integrations still work
- [ ] No new console errors
- [ ] Performance hasn't degraded
- [ ] Settings persist correctly
- [ ] Timers work accurately
- [ ] Notifications trigger properly
- [ ] Keyboard shortcuts functional
- [ ] Help documentation accurate
- [ ] Error messages helpful
- [ ] UI renders correctly

## 🚀 Release Checklist

Before releasing a new version:

- [ ] All tests passing
- [ ] No critical bugs
- [ ] Documentation updated
- [ ] Version number bumped
- [ ] Changelog updated
- [ ] Build tested on clean machine
- [ ] DMG installer works
- [ ] Permissions prompt correctly
- [ ] Auto-updater works (if implemented)
