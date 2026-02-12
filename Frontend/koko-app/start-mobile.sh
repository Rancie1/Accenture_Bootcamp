#!/bin/bash

# Helper script to start dev server for mobile testing
# Shows the IP address to access from your Android device

echo "🚀 Starting Koko for mobile testing..."
echo ""

# Get IP address (works on macOS)
IP=$(ipconfig getifaddr en0 2>/dev/null)

# If en0 doesn't work, try en1 (some Macs use different interface)
if [ -z "$IP" ]; then
    IP=$(ipconfig getifaddr en1 2>/dev/null)
fi

# If still no IP, show a helpful message
if [ -z "$IP" ]; then
    echo "⚠️  Could not detect IP address automatically"
    echo "Run 'ipconfig getifaddr en0' or 'ipconfig' to find your IP"
    echo ""
else
    echo "📱 Access from your Android device:"
    echo ""
    echo "   http://$IP:5173"
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
fi

echo "Starting development server..."
echo ""

npm run dev:mobile
