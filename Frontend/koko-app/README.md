# Koko - Gamified Savings App

A React-based mobile web application that helps users save money on groceries through gamification.

## Technology Stack

- **Frontend Framework**: React 19.2.0
- **Build Tool**: Vite 7.3.1
- **Routing**: React Router v6
- **Styling**: Tailwind CSS with custom purple theme
- **Typography**: Josefin Sans (Google Fonts)

## Setup Complete

### Installed Dependencies
- ✅ React Router v6 - for navigation
- ✅ Tailwind CSS - for styling
- ✅ @tailwindcss/postcss - PostCSS plugin

### Configuration
- ✅ Tailwind config with custom purple theme colors
  - Primary: #8B5CF6 (vibrant purple)
  - Mascot: #9e8fb2 (muted purple for koala)
- ✅ Josefin Sans font configured (weights: 400, 500, 600, 700)
- ✅ Dark mode enabled (class-based)
- ✅ Mobile-first viewport settings
- ✅ Apple mobile web app meta tags

### Project Structure
```
src/
├── components/
│   ├── Layout.jsx           # Base layout wrapper
│   └── BottomNavigation.jsx # 5-tab navigation component
├── App.jsx                  # Main app with React Router
├── main.jsx                 # Entry point
└── index.css                # Tailwind directives + Josefin Sans import
```

### Routes Configured
- `/` - Splash Screen
- `/register` - Registration
- `/shop` - Shop (with bottom nav)
- `/edit-list` - Edit List (chat interface)
- `/results` - Results
- `/leaderboard` - Leaderboard (with bottom nav)
- `/dashboard` - Dashboard (with bottom nav)
- `/settings` - Settings
- `/mascot` - Mascot customization (with bottom nav)
- `/saved` - Saved lists (with bottom nav)
- `/grimace` - Easter egg page

## Development

```bash
# Install dependencies
npm install

# Start dev server (local only)
npm run dev

# Start dev server for mobile testing (accessible from network)
npm run dev:mobile

# Quick start with IP display (macOS/Linux)
./start-mobile.sh

# Build for production
npm run build

# Preview production build (local)
npm run preview

# Preview production build (mobile testing)
npm run preview:mobile
```

## Mobile Testing (Android)

### Quick Start
```bash
./start-mobile.sh
```
This will show your IP address and start the dev server.

### Manual Setup
1. Start the mobile dev server:
   ```bash
   npm run dev:mobile
   ```

2. Find your computer's IP address:
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig` (look for IPv4)
   - Linux: `hostname -I`

3. On your Android device:
   - Connect to the same WiFi network
   - Open Chrome
   - Navigate to `http://YOUR_IP:5173`

### PWA Testing
See [PWA_SETUP.md](./PWA_SETUP.md) for detailed PWA installation and testing instructions.

## PWA Features

- ✅ Standalone display mode (no browser UI)
- ✅ Offline support with service workers
- ✅ Auto-update functionality
- ✅ Custom app icons (192x192, 512x512)
- ✅ Theme color integration
- ✅ Portrait orientation lock

## Next Steps

Implement the remaining tasks:
1. Core state management (AppContext)
2. Individual page components
3. n8n integration for chat
4. Property-based tests
