# Meditation Chrome Extension

A Chrome extension that provides guided meditation sessions with background music and voice guidance in English and Japanese.

## Features

- 🧘 Guided meditation sessions (5, 10, 15, 20 minutes)
- 🎵 Relaxing background music and nature sounds
- 🗣️ Natural voice guidance in English and Japanese
- 🎯 Multiple meditation types (breath awareness, body scan, etc.)
- 📱 Clean, minimalist interface
- 💾 Offline support for cached sessions

## Development

### Prerequisites

- Node.js 18+ and npm
- Chrome browser (for testing)
- Google Cloud account (for TTS API)
- Freesound API key (for music)

### Setup

1. Clone the repository:
```bash
git clone https://github.com/knishioka/meditation-chrome-extension.git
cd meditation-chrome-extension
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys
```

4. Build the extension:
```bash
npm run build
```

5. Load in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` folder

### Development Commands

```bash
npm run dev      # Watch mode for development
npm run build    # Production build
npm run lint     # Run ESLint
npm test         # Run tests
```

### Contributing

Please read [CLAUDE.md](CLAUDE.md) for development guidelines and [docs/DEVELOPMENT_PLAN.md](docs/DEVELOPMENT_PLAN.md) for the current roadmap.

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for technical details.

## License

MIT License - see LICENSE file for details.