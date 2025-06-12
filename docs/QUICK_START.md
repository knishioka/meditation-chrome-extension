# Quick Start Guide

## 🚀 5-Minute Setup

Want to start meditating right away? Follow these simple steps:

### 1. Download and Build

```bash
# Clone the repository
git clone https://github.com/knishioka/meditation-chrome-extension.git
cd meditation-chrome-extension

# Install dependencies
npm install

# Build the extension
npm run build
```

### 2. Install in Chrome

1. Open Chrome browser
2. Go to `chrome://extensions/`
3. Turn on **"Developer mode"** (top right corner)
4. Click **"Load unpacked"**
5. Select the `dist` folder from the project
6. Done! The meditation icon appears in your toolbar 🧘

### 3. Start Your First Session

1. Click the meditation icon in the toolbar
2. Select:
   - **Duration**: Start with 5 minutes
   - **Type**: Try "Breath Awareness" for beginners
   - **Background**: Choose "Ambient Music"
3. Click **"Start Meditation"**
4. Close your eyes and follow the voice guidance

## 🎯 Quick Tips

### For Beginners
- Start with 5-minute sessions
- Use "Breath Awareness" meditation type
- Keep background music at low volume
- Practice daily at the same time

### Keyboard Controls
- **Space**: Pause/Resume
- **Esc**: Stop session
- **↑/↓**: Voice volume
- **←/→**: Music volume

### Best Environment
- 🎧 Use headphones for best experience
- 🪑 Sit comfortably with back straight
- 📱 Put phone on silent
- 🚪 Choose a quiet space

## 🔊 Audio Not Working?

The extension works in offline mode by default. For natural voice guidance:

1. Get a Google Cloud TTS API key (free tier available)
2. Add it to `.env` file:
   ```
   GOOGLE_TTS_API_KEY=your_key_here
   ```
3. Rebuild: `npm run build`
4. Reload the extension in Chrome

## 🌐 Language Settings

### Switch to Japanese (日本語)
1. Click the settings icon
2. Select "言語" (Language)
3. Choose "日本語"
4. UI and voice guidance switch to Japanese

### Switch to English
1. Click the settings icon
2. Select "Language"
3. Choose "English"
4. UI and voice guidance switch to English

## 📊 Track Your Progress

After each session:
- Session is automatically saved to history
- View your meditation streak
- See total meditation time
- Track your favorite meditation types

## ⚡ Pro Tips

1. **Morning Routine**: Set a daily reminder for morning meditation
2. **Quick Access**: Right-click anywhere and select "Quick Meditation"
3. **Focus Mode**: Use during work breaks for quick stress relief
4. **Sleep Aid**: Try body scan meditation before bed

## 🆘 Need Help?

- **Not loading?** Make sure you selected the `dist` folder, not the project root
- **No sound?** Check Chrome's sound settings and extension permissions
- **Build errors?** Ensure Node.js 18+ is installed
- **Other issues?** Check [troubleshooting guide](../README.md#troubleshooting)

---

Ready to start your mindfulness journey? Click that meditation icon and begin! 🧘✨