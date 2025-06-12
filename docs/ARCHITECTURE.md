# Meditation Chrome Extension Architecture

## Overview
A Chrome extension that provides meditation sessions with background music and voice guidance in English and Japanese.

## Technical Architecture

### Manifest V3 Structure
```
meditation-extension/
├── manifest.json
├── background/
│   └── service-worker.js
├── offscreen/
│   ├── offscreen.html
│   └── offscreen.js
├── popup/
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── content/
│   └── content.js
├── assets/
│   ├── audio/
│   ├── icons/
│   └── locales/
├── lib/
│   ├── audio-manager.js
│   ├── tts-manager.js
│   └── api-client.js
└── config/
    └── settings.js
```

### Core Components

#### 1. Service Worker (background/service-worker.js)
- Manages extension lifecycle
- Handles audio playback requests via Offscreen API
- Manages API calls to external services
- Stores user preferences

#### 2. Offscreen Document (offscreen/)
- Handles all audio playback (required for Manifest V3)
- Manages Web Audio API for sound mixing
- Processes TTS audio generation
- Maintains audio session state

#### 3. Popup Interface (popup/)
- Main user interface
- Language selection (EN/JP)
- Meditation session controls
- Settings management

#### 4. Audio Management (lib/audio-manager.js)
- Coordinates background music and voice guidance
- Handles audio mixing and volume control
- Manages playback timing and synchronization

## API Integration Strategy

### Music Sources
**Primary (Free):** Freesound API
- Nature sounds, ambient music
- Creative Commons licensed
- Fallback: Local bundled audio files

**Premium Option:** Soundverse AI API
- AI-generated personalized meditation music
- Healing frequencies (432Hz, 528Hz)
- $99/month starter tier

### Voice Synthesis
**Primary:** Google Cloud Text-to-Speech
- WaveNet voices for natural sound
- Excellent Japanese support
- Generous free tier (1M characters/month)

**Alternative:** ElevenLabs
- Ultra-realistic voices
- Better emotional control
- 10,000 characters/month free

### Implementation Flow
```
User Action → Service Worker → Offscreen Document → Audio Output
                    ↓                    ↓
                API Calls          Audio Processing
                    ↓                    ↓
              External APIs        Web Audio API
```

## Key Features

### 1. Meditation Sessions
- Guided meditation with voice instructions
- Background ambient music
- Customizable session lengths (5, 10, 15, 20 minutes)
- Progress tracking

### 2. Audio Features
- Mix voice guidance with background music
- Volume controls for voice and music separately
- Fade in/out transitions
- Offline mode with cached audio

### 3. Localization
- Full support for English and Japanese
- Localized voice guidance
- Cultural-appropriate meditation content
- UI language switching

### 4. User Preferences
- Save preferred language
- Volume settings
- Favorite meditation types
- Session history

## Technical Implementation Details

### Audio Playback (Offscreen Document)
```javascript
// offscreen.js
class AudioPlayer {
  constructor() {
    this.audioContext = new AudioContext();
    this.musicGainNode = this.audioContext.createGain();
    this.voiceGainNode = this.audioContext.createGain();
  }
  
  async playMeditation(musicUrl, voiceText, language) {
    // Load and play background music
    const musicBuffer = await this.loadAudio(musicUrl);
    const musicSource = this.playBuffer(musicBuffer, this.musicGainNode);
    
    // Generate and play voice guidance
    const voiceAudio = await this.generateTTS(voiceText, language);
    const voiceSource = this.playBuffer(voiceAudio, this.voiceGainNode);
    
    // Mix and output
    this.musicGainNode.connect(this.audioContext.destination);
    this.voiceGainNode.connect(this.audioContext.destination);
  }
}
```

### Manifest Configuration
```json
{
  "manifest_version": 3,
  "name": "Meditation Extension",
  "permissions": [
    "offscreen",
    "storage",
    "alarms"
  ],
  "background": {
    "service_worker": "background/service-worker.js"
  },
  "action": {
    "default_popup": "popup/popup.html"
  },
  "web_accessible_resources": [{
    "resources": ["assets/audio/*"],
    "matches": ["<all_urls>"]
  }]
}
```

## Development Phases

### Phase 1: Core Infrastructure
- Set up Manifest V3 extension structure
- Implement offscreen audio playback
- Basic popup interface
- Local audio file playback

### Phase 2: API Integration
- Integrate Freesound API for music
- Add Google Cloud TTS
- Implement audio mixing
- Add language switching

### Phase 3: Enhanced Features
- Session customization
- Progress tracking
- Offline support
- Premium features (Soundverse AI)

### Phase 4: Polish
- Improved UI/UX
- Performance optimization
- User testing
- Chrome Web Store submission

## Security Considerations
- API keys stored securely (not in client code)
- CORS handling for external APIs
- Content Security Policy compliance
- User data privacy (local storage only)

## Performance Optimization
- Lazy load audio resources
- Cache frequently used sounds
- Optimize audio file sizes
- Efficient memory management in offscreen document

## Testing Strategy
- Unit tests for audio processing
- Integration tests for API calls
- Manual testing on different Chrome versions
- Performance profiling for audio playback