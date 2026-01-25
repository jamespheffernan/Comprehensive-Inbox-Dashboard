# Inbox Zero Dashboard

A GTD-style live dashboard for tracking all your inboxes with "inbox zero" timers. Built with Electron, React, TypeScript, and Zustand.

![Inbox Zero Dashboard](https://img.shields.io/badge/status-beta-blue) ![Platform](https://img.shields.io/badge/platform-macOS-lightgrey) ![License](https://img.shields.io/badge/license-MIT-green)

## ✨ Features

- **🔴 Live Data**: Automatic polling of digital inboxes (iMessage, WhatsApp, OmniFocus, file system, browser tabs, AI chats, Photos, Email)
- **⏱️ Inbox Zero Timer**: Tracks time since each inbox was last cleared to zero, with visual states at 12h (warning) and 24h (due)
- **📦 Physical Inbox Tracking**: Manual tap-to-clear for physical inboxes (mailbox, notebooks, etc.)
- **🔗 Deep Links**: Click any inbox card to open the corresponding app
- **💾 Persistent State**: Timer state persists across app restarts
- **🔔 Desktop Notifications**: Get notified when inboxes become overdue
- **🎨 6 Themes**: Deep Focus, Ocean, Forest, Sunset, Midnight, Monochrome
- **⌨️ Keyboard Shortcuts**: Cmd+R to sync, Cmd+, for settings, Cmd+/ for help
- **🔐 Privacy-First**: All data stays local, no cloud sync

## Inboxes Tracked

### Communication
- Email accounts (iCloud, Gmail, School)
- WhatsApp
- iMessage

### Device Capture
- Downloads folder
- Desktop
- Screenshots
- Photos app (recent imports)

### Tasks & Browser
- OmniFocus Inbox
- Browser tabs (Comet)

### AI Chats
- ChatGPT
- Claude
- Gemini

### Physical
- Physical Mailbox
- Notebooks
- Backpack Folder
- In-Tray

## Requirements

- macOS 12+ (for JXA/AppleScript integrations)
- Node.js 18+
- Full Disk Access permission (for iMessage/WhatsApp database access)
- OmniFocus 4 Pro (for OmniFocus integration)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Grant Full Disk Access

For iMessage and WhatsApp integration:

1. Open **System Settings** → **Privacy & Security** → **Full Disk Access**
2. Add your terminal app and/or the Inbox Zero Dashboard app

### 3. Development

```bash
# Start Vite dev server and Electron
npm run electron:dev
```

### 4. Build

```bash
# Build for distribution
npm run electron:build
```

## Integration Details

### iMessage & WhatsApp
Queries the SQLite databases directly:
- iMessage: `~/Library/Messages/chat.db`
- WhatsApp: `~/Library/Group Containers/group.net.whatsapp.WhatsApp.shared/ChatStorage.sqlite`

### OmniFocus
Uses JXA (JavaScript for Automation) to query OmniFocus 4.
Based on patterns from [OmniFocus-MCP](https://github.com/themotionmachine/OmniFocus-MCP).

### AI Chats
Integrates with the [Inbox Importer AI Chats](https://github.com/user/Inbox-Importer-AI-Chats) project.
Reads from `conversation-index.json` to track new conversations.

### Browser Tabs
Uses AppleScript to count open tabs in Comet browser.
Falls back to manual tracking if AppleScript access is unavailable.

### File System
Uses `chokidar` to watch Downloads, Desktop, and Screenshots folders.

## Tech Stack

- **Electron**: Cross-platform desktop app
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Vite**: Build tool
- **Zustand**: State management with persistence
- **better-sqlite3**: SQLite database access
- **chokidar**: File system watching

## Project Structure

```
├── electron/
│   ├── main.cjs              # Main process
│   ├── preload.cjs           # Secure IPC bridge
│   └── connectors/           # Data source connectors
│       ├── messaging.cjs     # iMessage/WhatsApp
│       ├── omnifocus.cjs     # OmniFocus JXA
│       ├── filesystem.cjs    # File system watcher
│       ├── browser.cjs       # Browser tabs
│       ├── ai-chats.cjs      # AI chat importer
│       └── photos.cjs        # Photos app
├── src/
│   ├── components/           # React components
│   ├── store/                # Zustand stores
│   ├── types/                # TypeScript types
│   └── App.tsx               # Main app
└── package.json
```

## 📚 Documentation

- **[SETUP.md](SETUP.md)** - Complete setup guide for all integrations
- **[INTEGRATIONS.md](INTEGRATIONS.md)** - Technical details on how each integration works
- **[TESTING.md](TESTING.md)** - Testing guide and checklist

## ⌨️ Keyboard Shortcuts

- `Cmd+R` - Sync all inboxes
- `Cmd+,` - Open settings
- `Cmd+/` - Show help
- `Cmd+Q` - Quit app
- `Cmd+W` - Close window

## 🎨 Screenshots

### Dashboard View
The main dashboard shows all your inboxes organized by category with live counts and timers.

### Settings
Configure themes, email accounts, and notification preferences.

### Timer States
- **Green** - At zero, timer counting up
- **Blue** - Active with items to process
- **Orange** - 12+ hours since last zero (warning)
- **Red** - 24+ hours since last zero (due!)

## 🤝 Contributing

This is a personal productivity tool, but contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- macOS version
- App version
- Steps to reproduce
- Expected vs actual behavior
- Console logs (if applicable)

## 🗺️ Roadmap

- [ ] Windows/Linux support (limited - some integrations are macOS-only)
- [ ] Slack/Discord integration
- [ ] GitHub notifications
- [ ] Calendar events as inbox
- [ ] Custom inbox types
- [ ] Export/import settings
- [ ] Stats and analytics
- [ ] Mobile companion app (view-only)

## 🙏 Acknowledgments

Built with inspiration from:
- [OmniFocus-MCP](https://github.com/themotionmachine/OmniFocus-MCP) - OmniFocus automation patterns
- [elie222/inbox-zero](https://github.com/elie222/inbox-zero) - Email management approach
- Your existing tools: Daily Brief Skill, Inbox Importer AI Chats, Blinders

## 📄 License

MIT License - see LICENSE file for details

---

**Made with ❤️ for GTD practitioners who want to stay on top of all their inboxes.**
