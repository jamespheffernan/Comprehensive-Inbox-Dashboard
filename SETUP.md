# Inbox Zero Dashboard - Setup Guide

Complete setup instructions for all integrations.

## 🚀 Quick Start

```bash
cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
npm install
npm run electron:dev
```

## 📋 Prerequisites

- **macOS 12+** (for JXA/AppleScript integrations)
- **Node.js 18+**
- **OmniFocus 4 Pro** (for task tracking)

## 🔐 Permissions Required

### 1. Full Disk Access

Required for iMessage and WhatsApp database access.

**Steps:**
1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Click the **+** button
3. Add these applications:
   - Your Terminal app (Terminal.app, iTerm, etc.)
   - The Inbox Zero Dashboard app (after building)
4. Restart the terminal/app after granting access

**What this enables:**
- iMessage unread count from `~/Library/Messages/chat.db`
- WhatsApp unread count from `~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite`

### 2. Automation Permissions

Required for OmniFocus, Photos, and browser integrations.

**Steps:**
1. When you first run the app, macOS will prompt for automation permissions
2. Allow access for:
   - **OmniFocus** (to read inbox count)
   - **Photos** (to count recent imports)
   - **Safari/Chrome/Arc** (to count open tabs)

## 📧 Email Setup

### Gmail Integration

**1. Create Google Cloud Project**

Visit [Google Cloud Console](https://console.cloud.google.com/):

1. Create a new project or select existing
2. Enable the **Gmail API**
3. Go to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. Choose **Desktop app** as application type
6. Download the JSON credentials file

**2. Install Credentials**

```bash
mkdir -p ~/.inbox-zero-dashboard
cp ~/Downloads/client_secret_*.json ~/.inbox-zero-dashboard/gmail-credentials.json
```

**3. Authenticate**

1. Open the app
2. Click **Settings** (gear icon)
3. Go to **Email Setup** tab
4. Click **Authenticate with Gmail**
5. Follow the OAuth flow in your browser
6. Grant permissions to read Gmail labels

**What this enables:**
- Live unread count for Gmail inboxes
- No email content is accessed, only label counts

### iCloud Mail Integration

**1. Generate App-Specific Password**

Visit [Apple ID Account](https://appleid.apple.com/account/manage):

1. Sign in with your Apple ID
2. Go to **Security** section
3. Under **App-Specific Passwords**, click **Generate Password**
4. Label it "Inbox Zero Dashboard"
5. Copy the generated password (format: `xxxx-xxxx-xxxx-xxxx`)

**2. Configure in App**

1. Open the app
2. Click **Settings** → **Email Setup**
3. Enter your iCloud email (e.g., `you@icloud.com`)
4. Paste the app-specific password
5. Click **Save iCloud Settings**

**What this enables:**
- Live unread count for iCloud Mail via IMAP
- Secure access without exposing your main password

## 🤖 AI Chats Integration

This app integrates with your existing [Inbox Importer AI Chats](https://github.com/user/Inbox-Importer-AI-Chats) project.

**Setup:**

1. Navigate to the AI Chat Importer:
   ```bash
   cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats
   ```

2. Run the setup (if not already done):
   ```bash
   npm run setup
   ```

3. This will:
   - Open browser windows for ChatGPT, Claude, and Gemini
   - Prompt you to log in to each service
   - Save persistent browser sessions

4. The Inbox Zero Dashboard will automatically read from:
   ```
   ~/Documents/GitHub/Inbox Importer AI Chats/conversation-index.json
   ```

**How it works:**
- The AI Chat Importer tracks all conversations with timestamps
- The dashboard counts "new" conversations since you last cleared that inbox
- Click an AI chat card to open that service in your browser

## 📁 File System Monitoring

Automatically enabled! The app watches:

- **Downloads**: `~/Downloads`
- **Desktop**: `~/Desktop`
- **Screenshots**: `~/Desktop` or `~/Pictures/Screenshots`

**No setup required** - these are monitored using `chokidar` file watchers.

## ✅ OmniFocus Integration

**Requirements:**
- OmniFocus 4 Pro (Professional edition)
- OmniFocus must be running

**Setup:**

1. Enable JavaScript automation in OmniFocus:
   - Open OmniFocus
   - Go to **OmniFocus** → **Settings** → **Automation**
   - Ensure automation is enabled

2. Grant automation permission when prompted by macOS

**What this enables:**
- Live inbox count from OmniFocus
- Click to open `omnifocus:///inbox` deep link

## 🌐 Browser Tabs Integration

**Supported Browsers:**
- Comet (by Perplexity) - your main browser
- Safari
- Chrome
- Arc

**Setup:**

The app uses AppleScript to count open tabs. No additional setup required, but:

1. The browser must be running
2. macOS will prompt for automation permission on first use
3. If a browser doesn't support AppleScript, it will show as manual tracking

**Comet Browser:**
- If Comet doesn't support AppleScript, the card will show "manual" mode
- You can still click to open Comet and manually mark as cleared

## 📸 Photos Integration

**Setup:**

1. Grant automation permission when prompted
2. The app counts photos from the last 24 hours in:
   - "Imports" album (if exists)
   - "Recents" album
   - All photos (fallback)

**Alternative (if JXA fails):**

The app will attempt to read the Photos SQLite database:
- Requires **Full Disk Access**
- Database location: `~/Pictures/Photos Library.photoslibrary/database/Photos.sqlite`

## 🗂️ Physical Inboxes

These are **manual tracking only**:

- Physical Mailbox
- Notebooks
- Backpack Folder
- In-Tray

**How to use:**
1. Process the physical inbox to zero
2. Click the "Tap to clear" button in the app
3. Timer starts counting up from zero
4. You'll get a notification at 24 hours

## 🔔 Notifications

**Setup:**

1. When first launched, macOS will ask for notification permissions
2. Click **Allow** to enable desktop notifications
3. Configure in **Settings** → **Notifications**:
   - Enable/disable notifications for due inboxes
   - Enable/disable sound
   - Show badge in dock

**Notification triggers:**
- Inboxes that haven't been processed for 24+ hours
- Sent every 5 minutes while overdue
- Only one notification per inbox per "due period"

## 🎨 Themes

6 built-in themes available in **Settings** → **Appearance**:

1. **Deep Focus** (default) - Teal & cyan
2. **Ocean** - Blue depths
3. **Forest** - Green serenity
4. **Sunset** - Warm oranges
5. **Midnight** - Purple nights
6. **Monochrome** - Pure contrast

## 🐛 Troubleshooting

### iMessage/WhatsApp shows "Cannot access database"

**Solution:** Grant Full Disk Access (see above)

### OmniFocus shows "not running or automation not enabled"

**Solutions:**
1. Make sure OmniFocus is running
2. Check automation is enabled in OmniFocus settings
3. Grant automation permission in System Settings

### Gmail shows "not configured"

**Solution:** Add credentials file to `~/.inbox-zero-dashboard/gmail-credentials.json`

### AI Chats show "not configured"

**Solution:** 
1. Verify the AI Chat Importer is set up
2. Check that `conversation-index.json` exists
3. Run `npm run export` in the AI Chat Importer project

### Browser tabs show "manual tracking"

**Solution:** 
- Some browsers don't support AppleScript
- Use manual mode: click the card to open browser, then click "Mark as cleared"

### Photos shows error

**Solutions:**
1. Grant automation permission for Photos app
2. If still failing, grant Full Disk Access for Photos library

## 📊 Timer System

**States:**

- **Zero** (Green) - Inbox is at zero, timer counting up
- **Active** (Blue) - Inbox has items to process
- **Warning** (Orange) - 12+ hours since last zero
- **Due** (Red) - 24+ hours since last zero, needs attention!

**Timer behavior:**
- Resets to zero when you clear an inbox
- Persists across app restarts
- Shows time since last zero (e.g., "5h since ∅")
- Notifications trigger at 24h mark

## 🔄 Sync Behavior

- **Auto-sync**: Every 60 seconds
- **Manual sync**: Click the refresh button in header
- **On startup**: Syncs all inboxes immediately

## 💾 Data Storage

All data is stored locally:

- **Timer state**: `localStorage` (persisted in browser)
- **Gmail credentials**: `~/.inbox-zero-dashboard/gmail-credentials.json`
- **Gmail token**: `~/.inbox-zero-dashboard/gmail-token.json`
- **AI chat index**: `~/Documents/GitHub/Inbox Importer AI Chats/conversation-index.json`

**No cloud sync** - everything stays on your Mac.

## 🚢 Building for Distribution

```bash
npm run electron:build
```

The built app will be in `dist-electron/`.

Install the DMG and grant permissions as described above.

## 📝 Next Steps

1. Grant all required permissions
2. Set up email integrations (optional)
3. Customize themes in Settings
4. Start processing your inboxes to zero!
5. Watch the timers and stay on top of your GTD workflow

## 🆘 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review console logs in DevTools (View → Toggle Developer Tools)
3. Check terminal output for connector errors
