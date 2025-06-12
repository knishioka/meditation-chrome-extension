# Meditation Chrome Extension 🧘

A Chrome extension that provides guided meditation sessions with soothing background music and natural voice guidance in English and Japanese. Built with modern web technologies and designed for a calming user experience.

![Chrome Web Store Version](https://img.shields.io/badge/manifest-v3-blue)
![Languages](https://img.shields.io/badge/languages-EN%20%7C%20JA-green)
![License](https://img.shields.io/badge/license-MIT-purple)

## ✨ Features

### Core Features
- **🧘 Guided Meditation Sessions** - Choose from 5, 10, 15, 20, or 30-minute sessions
- **🎵 Background Ambience** - Relaxing music, nature sounds, or silence
- **🗣️ Natural Voice Guidance** - AI-powered voice synthesis in English and Japanese
- **🎯 Meditation Styles** - Breath awareness, body scan, loving-kindness, and mindfulness
- **📱 Clean Interface** - Minimalist design focused on calm and clarity
- **💾 Offline Support** - Works without internet after initial setup

### Advanced Features
- **⏰ Meditation Reminders** - Daily notification reminders
- **📊 Progress Tracking** - Track your meditation history
- **🎚️ Customizable Audio** - Separate volume controls for voice and music
- **🌙 Context Menu** - Quick access to meditation from any webpage
- **🔔 Session Notifications** - Gentle notifications when sessions complete

## 📦 Installation

### From Chrome Web Store (Coming Soon)
The extension will be available on the Chrome Web Store after review.

### Manual Installation (Developer Mode)

1. **Download the Extension**
   ```bash
   git clone https://github.com/knishioka/meditation-chrome-extension.git
   cd meditation-chrome-extension
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Up API Keys (Optional)**
   
   For full functionality, you'll need:
   - Google Cloud Text-to-Speech API key
   - Freesound API key
   
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```
   
   > **Note**: The extension works in offline mode without API keys, using pre-recorded audio files.

4. **Build the Extension**
   ```bash
   npm run build
   ```

5. **Load into Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable **"Developer mode"** (toggle in top right)
   - Click **"Load unpacked"**
   - Select the `dist` folder from the project directory
   - The extension icon should appear in your toolbar!

## 🚀 Usage

### Getting Started

1. **Click the Extension Icon** - Opens the meditation interface
2. **Choose Your Settings**:
   - Duration (5-30 minutes)
   - Meditation type
   - Background sound preference
   - Language (English/Japanese)
3. **Start Meditation** - Click "Start Meditation" to begin
4. **During Session**:
   - Pause/resume anytime
   - Adjust volume on the fly
   - Stop session if needed

### Meditation Types

#### 🌬️ Breath Awareness
Focus on your natural breathing rhythm. Perfect for beginners and stress relief.

#### 🏃 Body Scan
Progressive relaxation through body awareness. Great for physical tension release.

#### 💝 Loving-Kindness
Cultivate compassion for yourself and others. Enhances emotional well-being.

#### 🎯 Mindfulness
Present moment awareness practice. Improves focus and mental clarity.

### Keyboard Shortcuts

- `Space` - Play/Pause
- `Esc` - Stop session
- `↑/↓` - Adjust voice volume
- `←/→` - Adjust music volume

## 🛠️ Development

### Prerequisites

- Node.js 18+ and npm 9+
- Chrome browser (version 110+)
- Git

### Development Setup

1. **Clone and Install**
   ```bash
   git clone https://github.com/knishioka/meditation-chrome-extension.git
   cd meditation-chrome-extension
   npm install
   ```

2. **Development Mode**
   ```bash
   npm run dev  # Starts webpack in watch mode
   ```

3. **Run Tests**
   ```bash
   npm test           # Run all tests
   npm test:watch     # Run tests in watch mode
   npm test:coverage  # Generate coverage report
   ```

4. **Code Quality**
   ```bash
   npm run lint       # Check code style
   npm run lint:fix   # Auto-fix issues
   npm run format     # Format with Prettier
   ```

### Project Structure

```
meditation-chrome-extension/
├── src/
│   ├── background/       # Service worker
│   ├── offscreen/       # Audio playback handler
│   ├── popup/           # Extension popup UI
│   ├── content/         # Content scripts
│   ├── lib/             # Core libraries
│   │   ├── audio-manager.js
│   │   ├── meditation-content.js
│   │   ├── storage-manager.js
│   │   ├── tts-script-generator.js
│   │   └── tts-service.js
│   └── config/          # Configuration
├── public/              # Static assets
│   ├── manifest.json    # Extension manifest
│   └── _locales/        # Translations
├── tests/               # Test files
└── docs/                # Documentation
```

### API Configuration

The extension supports two external APIs for enhanced functionality:

#### Google Cloud Text-to-Speech
- Provides natural voice synthesis
- Supports multiple languages and voices
- Free tier: 1 million characters/month

#### Freesound API
- Access to meditation music and nature sounds
- Community-driven audio library
- Free with registration

See [docs/EXTERNAL_SETUP.md](docs/EXTERNAL_SETUP.md) for detailed setup instructions.

## 🔧 Configuration

### User Preferences

All settings are saved locally and synced across devices:

- **Language**: English or Japanese interface and voice
- **Default Duration**: Your preferred session length
- **Audio Preferences**: Volume levels and sound choices
- **Reminders**: Daily meditation reminder time

### Offline Mode

The extension includes fallback audio for offline use:
- Basic voice guidance in both languages
- Ambient background sounds
- Limited but functional meditation experience

## 🤝 Contributing

We welcome contributions! Please see:

- [CLAUDE.md](CLAUDE.md) - Development guidelines and standards
- [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) - Current roadmap and tasks
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) - Technical architecture

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Google Cloud Text-to-Speech for natural voice synthesis
- Freesound community for meditation audio
- All contributors and testers

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/knishioka/meditation-chrome-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/knishioka/meditation-chrome-extension/discussions)
- **Email**: support@example.com

---

Made with 💙 for mindfulness and well-being