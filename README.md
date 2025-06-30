# 🧘 Meditation Chrome Extension

A privacy-focused Chrome extension that provides guided meditation sessions with soothing background music and voice guidance in English and Japanese. Works completely offline with no external dependencies.

![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-4285F4?logo=google-chrome&logoColor=white)
![Manifest](https://img.shields.io/badge/Manifest-V3-green)
![Offline](https://img.shields.io/badge/Works-Offline-orange)
![Languages](https://img.shields.io/badge/Languages-EN%20%7C%20JA-blue)

## ✨ Features

- **🌐 Bilingual Support**: Full support for English and Japanese meditation guidance
- **🎵 Multiple Meditation Types**:
  - Breath Awareness
  - Body Scan
  - Loving Kindness
  - Mindfulness
- **⏱️ Flexible Duration**: 5, 10, 15, 20, or 30-minute sessions
- **🎶 Background Options**: Nature sounds, ambient music, or silence
- **🔒 Complete Privacy**: Works 100% offline, no data collection
- **🎨 Clean Interface**: Simple, distraction-free design
- **📱 Responsive**: Works on all screen sizes

## 🚀 Quick Start

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/yourusername/meditation-chrome-extension.git
   cd meditation-chrome-extension
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Generate audio resources** (see [Audio Setup](#-audio-setup)):
   ```bash
   npm run generate:audio-list
   ```

4. **Build the extension**:
   ```bash
   npm run build
   ```

5. **Load in Chrome**:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

## 🎵 Audio Setup

This extension requires audio files for voice guidance and background music. Due to the offline-first design, these need to be generated before use.

### Option 1: Quick Setup (Recommended)
Use the provided audio generation tools:

```bash
# Generate list of required audio files
npm run generate:audio-list

# View the generation report
open scripts/audio-generation/audio-generation-report.md
```

Then use [TTSMaker.com](https://ttsmaker.com) (free, no registration) to generate voices:
- Language: English or Japanese
- Voice: Choose calm, meditation-appropriate voices
- Speed: 0.9x
- Download as MP3

### Option 2: Automated Generation
If you have TTS API keys:

```bash
# Create .env.local with your API keys
cp .env.example .env.local

# Run automated generation
npm run generate:audio
```

Supported APIs:
- Google Cloud Text-to-Speech
- Microsoft Azure Speech Services
- Amazon Polly

### Audio File Structure
```
public/audio/
├── voice/
│   ├── en/          # English voice files
│   └── ja/          # Japanese voice files
└── background/
    ├── nature/      # Nature sounds (rain, ocean, forest)
    └── ambient/     # Ambient meditation music
```

## 🛠️ Development

### Prerequisites
- Node.js 16+
- npm or yarn
- Chrome browser

### Development Setup

```bash
# Install dependencies
npm install

# Start development server with hot reload
npm run dev

# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```

### Project Structure
```
meditation-chrome-extension/
├── public/              # Static assets
│   ├── manifest.json    # Extension manifest
│   ├── _locales/        # i18n translations
│   └── audio/           # Audio files (generated)
├── src/
│   ├── background/      # Service worker
│   ├── popup/           # Extension popup UI
│   ├── offscreen/       # Audio playback handler
│   ├── lib/             # Core libraries
│   └── config/          # Configuration
├── scripts/             # Build and generation scripts
└── tests/               # Test files
```

### Key Technologies
- **Chrome Extension Manifest V3**: Latest extension platform
- **Service Workers**: Background processing
- **Offscreen Documents**: Audio playback (required for MV3)
- **Web Audio API**: Advanced audio control
- **ES6 Modules**: Modern JavaScript
- **Webpack**: Module bundling

## 📖 User Guide

### Starting a Meditation Session

1. Click the extension icon in your Chrome toolbar
2. Select your preferences:
   - **Duration**: Choose session length (5-30 minutes)
   - **Type**: Select meditation style
   - **Background**: Pick ambient sound or silence
   - **Language**: Switch between English and Japanese
3. Click "Start Meditation" to begin
4. Use controls to pause, resume, or stop the session

### Meditation Types Explained

- **🌬️ Breath Awareness**: Focus on breathing patterns
- **🔍 Body Scan**: Progressive relaxation through body awareness
- **💝 Loving Kindness**: Cultivate compassion and positive emotions
- **🧠 Mindfulness**: Present-moment awareness practice

### Customization Options

- **Voice Volume**: Adjust guidance voice level
- **Music Volume**: Control background sound level
- **Voice Gender**: Choose preferred voice (when available)

## 🔧 API Documentation

### Core Modules

#### AudioManager
Manages audio playback through the offscreen document.

```javascript
// Start a meditation session
await audioManager.startSession({
  type: 'breath_awareness',
  duration: 600000, // 10 minutes
  language: 'en',
  backgroundSound: 'nature_sounds'
});

// Control playback
await audioManager.pause();
await audioManager.resume();
await audioManager.stop();
```

#### StorageManager
Handles user preferences and session history.

```javascript
// Get user preferences
const prefs = await storageManager.getUserPreferences();

// Update preferences
await storageManager.updatePreference('language', 'ja');

// Get session history
const history = await storageManager.getSessionHistory(10);
```

#### MeditationContent
Provides meditation scripts and timing.

```javascript
// Get meditation script
const script = meditationContent.getScript(
  'body_scan',    // type
  'ja',           // language
  900000          // 15 minutes
);
```

## 🌍 Internationalization

The extension supports multiple languages through Chrome's i18n API:

```javascript
// In JavaScript
chrome.i18n.getMessage('welcome_message');

// In HTML
<span data-i18n="welcome_message"></span>
```

Add new languages by creating a folder in `public/_locales/` with a `messages.json` file.

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Generate coverage report
npm run test:coverage
```

### Test Structure
- Unit tests for utility functions
- Integration tests for Chrome APIs
- Mock implementations for audio playback

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Code Style
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Meditation content inspired by traditional mindfulness practices
- Audio processing techniques from Web Audio API documentation
- Chrome Extension architecture based on Google's best practices

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/yourusername/meditation-chrome-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/meditation-chrome-extension/discussions)
- **Email**: support@example.com

## 🗺️ Roadmap

- [ ] Additional meditation types (walking, sleep)
- [ ] Progress tracking and statistics
- [ ] Custom meditation builder
- [ ] More language support
- [ ] Sync settings across devices
- [ ] Integration with health apps

---

Made with ❤️ for mindfulness and well-being