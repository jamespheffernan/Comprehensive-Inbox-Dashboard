# Quick Start Guide

Get up and running with Inbox Zero Dashboard in 5 minutes.

## ⚡ 1-Minute Setup (Minimal)

```bash
cd "/Users/jamesheffernan/Documents/GitHub/Comprehensive Inbox Dashboard"
npm install
npm run electron:dev
```

The app will launch! Most integrations will work immediately, but some need permissions.

## 🔐 5-Minute Setup (Recommended)

### Step 1: Grant Full Disk Access

**Required for:** iMessage, WhatsApp

1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Click **+** and add your Terminal app
3. Restart Terminal

### Step 2: Grant Automation Permissions

**Required for:** OmniFocus, Photos, Browser tabs

When the app first tries to access these, macOS will prompt you. Click **OK** on each prompt.

### Step 3: Launch OmniFocus

**Required for:** OmniFocus inbox count

Just make sure OmniFocus is running in the background.

### Step 4: Start Using!

That's it! You now have:
- ✅ iMessage unread count
- ✅ WhatsApp unread count  
- ✅ OmniFocus inbox count
- ✅ Downloads/Desktop/Screenshots file counts
- ✅ Browser tab counts
- ✅ Photos count
- ✅ Physical inbox tracking

## 📧 Optional: Email Setup (10 minutes)

### Gmail

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create project → Enable Gmail API → Create OAuth credentials
3. Download JSON file
4. Save as `~/.inbox-zero-dashboard/gmail-credentials.json`
5. In app: Settings → Email Setup → Authenticate with Gmail

### iCloud Mail

1. Go to [Apple ID](https://appleid.apple.com/)
2. Generate app-specific password
3. In app: Settings → Email Setup → Enter email + password

## 🤖 Optional: AI Chats Setup (5 minutes)

If you have the AI Chat Importer set up:

```bash
cd ~/Documents/GitHub/Inbox\ Importer\ AI\ Chats
npm run setup  # If not already done
npm run export # To populate the index
```

The dashboard will automatically read from `conversation-index.json`.

## 🎨 Customize Your Experience

1. Press **Cmd+,** to open Settings
2. Go to **Appearance** tab
3. Choose your favorite theme
4. Adjust timer thresholds if desired

## ⌨️ Learn the Shortcuts

- **Cmd+R** - Sync all inboxes
- **Cmd+,** - Open settings
- **Cmd+/** - Show help

## 🎯 Your First Inbox Zero

1. Click any inbox card with items
2. The app/folder will open
3. Process all items to zero
4. Watch the timer start counting up!
5. Try to keep it green (< 12 hours)

## 📱 Understanding the Colors

- **Green border** - At zero, timer counting up
- **Blue border** - Has items to process
- **Orange border** - 12+ hours since zero (warning)
- **Red border** - 24+ hours since zero (due!)

## 🔔 Enable Notifications

1. When macOS prompts, click **Allow**
2. You'll get notified when inboxes hit 24 hours
3. Can disable in Settings → Notifications

## 🆘 Troubleshooting

### "Cannot access Messages database"
→ Grant Full Disk Access (see Step 1)

### "OmniFocus is not running"
→ Launch OmniFocus

### "Gmail not configured"
→ Follow Email Setup above

### "AI Chat Importer not configured"
→ Set up the AI Chat Importer project

### Something else?
→ Check `SETUP.md` for detailed instructions

## 📚 Next Steps

- Read **[SETUP.md](SETUP.md)** for detailed setup
- Read **[INTEGRATIONS.md](INTEGRATIONS.md)** to understand how it works
- Press **Cmd+/** in the app for help

## 🎉 You're Ready!

Start processing your inboxes to zero and let the dashboard help you stay on top of everything!

---

**Pro Tip:** Set a daily reminder to check the dashboard and process any red/orange inboxes. Consistency is key to GTD success!
