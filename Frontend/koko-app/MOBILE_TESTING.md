# Mobile Testing Quick Reference

## 🚀 Quick Start

```bash
./start-mobile.sh
```

This script will:
1. Display your IP address
2. Start the dev server on `0.0.0.0:5173`
3. Show the URL to access from your Android device

## 📱 Manual Commands

### Development Server
```bash
npm run dev:mobile
```

### Production Preview
```bash
npm run build
npm run preview:mobile
```

## 🔍 Find Your IP Address

### macOS
```bash
ipconfig getifaddr en0
```

### Windows
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

### Linux
```bash
hostname -I
```

## 📲 Testing on Android

1. **Connect to WiFi**
   - Ensure your Android device and computer are on the same WiFi network

2. **Start Server**
   ```bash
   npm run dev:mobile
   ```

3. **Access from Android**
   - Open Chrome on your Android device
   - Navigate to: `http://YOUR_IP:5173`
   - Example: `http://192.168.1.100:5173`

4. **Install as PWA**
   - Tap the menu (⋮) in Chrome
   - Select "Add to Home screen"
   - Name it "Koko"
   - Tap "Add"

5. **Launch & Verify**
   - Tap the Koko icon on your home screen
   - App should open WITHOUT browser UI
   - Status bar should show Koko purple theme color
   - Full-screen experience

## ✅ PWA Checklist

When testing the installed PWA, verify:
- [ ] No address bar visible
- [ ] No browser toolbar
- [ ] Purple theme color in status bar
- [ ] App launches in portrait mode
- [ ] Smooth navigation between pages
- [ ] Bottom navigation works correctly
- [ ] Images and icons load properly

## 🐛 Troubleshooting

### Can't Connect from Android?

1. **Check WiFi**
   - Both devices on same network?
   - Not using guest network?

2. **Check Firewall**
   - Allow port 5173 through firewall
   - Temporarily disable firewall to test

3. **Verify Server**
   - Server shows "Network: http://YOUR_IP:5173"?
   - Try accessing from computer browser first

4. **Try Different IP**
   - Some Macs use `en1` instead of `en0`
   - Run `ifconfig` to see all interfaces

### PWA Not Installing?

1. **Use HTTPS or localhost**
   - PWAs require secure context
   - Network IP (http://) has limited features
   - For full PWA testing, deploy to HTTPS server

2. **Clear Browser Data**
   - Clear Chrome cache and data
   - Try in incognito mode first

3. **Check Manifest**
   - Open DevTools → Application → Manifest
   - Verify all icons load correctly

## 🎯 Testing Workflow

### Daily Development
```bash
./start-mobile.sh
# Access from Android: http://YOUR_IP:5173
```

### PWA Testing
```bash
npm run build
npm run preview:mobile
# Install on Android and test standalone mode
```

### Production Deployment
```bash
npm run build
# Deploy dist/ folder to hosting service with HTTPS
```

## 📝 Notes

- Dev server with `--host 0.0.0.0` allows network access
- Port 5173 is the default Vite port
- Service workers only work on localhost or HTTPS
- For full PWA features, deploy to HTTPS hosting
- Hot reload works over network connection
