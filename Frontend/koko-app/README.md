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

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Next Steps

Implement the remaining tasks:
1. Core state management (AppContext)
2. Individual page components
3. n8n integration for chat
4. Property-based tests
