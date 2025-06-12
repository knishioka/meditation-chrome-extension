# External Setup Requirements

This document outlines the external services and API keys required for the full functionality of the Meditation Chrome Extension.

## Required External Services

### 1. Google Cloud Text-to-Speech API

**Purpose**: Generate natural-sounding voice guidance for meditation sessions in English and Japanese.

**Setup Steps**:
1. Create a Google Cloud Platform account
2. Enable the Text-to-Speech API
3. Create API credentials (API key or Service Account)
4. Set up billing (free tier available: 1M characters/month for WaveNet voices)

**Configuration**:
- Store API key in environment variable: `GOOGLE_TTS_API_KEY`
- Or use Service Account JSON file: `GOOGLE_APPLICATION_CREDENTIALS`

**Documentation**: https://cloud.google.com/text-to-speech/docs/quickstart

### 2. Freesound API

**Purpose**: Access royalty-free meditation music and nature sounds.

**Setup Steps**:
1. Create an account at https://freesound.org
2. Apply for API access at https://freesound.org/apiv2/apply
3. Obtain API key (usually approved within 24 hours)

**Configuration**:
- Store API key in environment variable: `FREESOUND_API_KEY`
- API limits: 60 requests/minute, 2000 requests/day

**Documentation**: https://freesound.org/docs/api/

### 3. Optional: Soundverse AI API (Premium Feature)

**Purpose**: AI-generated personalized meditation music with healing frequencies.

**Setup Steps**:
1. Sign up at Soundverse AI website
2. Choose subscription plan (Starter: $99/month)
3. Obtain API credentials

**Configuration**:
- Store API key in environment variable: `SOUNDVERSE_API_KEY`

## Environment Variables Setup

Create a `.env` file in the project root:

```bash
# Google Cloud Text-to-Speech
GOOGLE_TTS_API_KEY=your_google_tts_api_key_here

# Freesound API
FREESOUND_API_KEY=your_freesound_api_key_here
FREESOUND_CLIENT_ID=your_freesound_client_id_here

# Optional: Soundverse AI
SOUNDVERSE_API_KEY=your_soundverse_api_key_here

# Development/Production
NODE_ENV=development
```

## Chrome Extension Configuration

### For Development

1. API keys should be loaded from environment variables during build
2. Use webpack's DefinePlugin to inject them into the bundle
3. Never commit actual API keys to the repository

### For Production

1. Store API keys securely in Chrome's storage.sync
2. Provide a settings page for users to enter their own API keys
3. Or use a proxy server to keep API keys server-side

## Local Development Without APIs

The extension can run in "offline mode" with limited functionality:

1. **Local Audio Files**: Place meditation music in `src/assets/audio/`
2. **Mock TTS**: Use pre-recorded voice files for testing
3. **Development Mode**: Set `OFFLINE_MODE=true` in `.env`

### Sample Audio Files Needed

Place these in `src/assets/audio/` for offline development:

```
audio/
├── music/
│   ├── ambient-1.mp3
│   ├── nature-rain.mp3
│   └── nature-ocean.mp3
├── voice/
│   ├── en/
│   │   ├── welcome.mp3
│   │   ├── breath-in.mp3
│   │   └── session-complete.mp3
│   └── ja/
│       ├── welcome.mp3
│       ├── breath-in.mp3
│       └── session-complete.mp3
└── silence.mp3
```

## Security Best Practices

1. **Never commit API keys** to the repository
2. **Use environment variables** for local development
3. **Implement rate limiting** to prevent API quota exhaustion
4. **Cache API responses** to minimize API calls
5. **Provide fallbacks** for when APIs are unavailable

## Testing with Mock APIs

For unit tests, all external APIs are mocked. See `tests/setup.js` for mock implementations.

For integration tests, you can:
1. Use test API keys with limited quotas
2. Mock API responses with recorded data
3. Use local test servers

## Deployment Checklist

Before deploying to Chrome Web Store:

- [ ] Remove all API keys from code
- [ ] Implement secure API key storage
- [ ] Test with production API endpoints
- [ ] Verify API rate limits won't be exceeded
- [ ] Set up monitoring for API usage
- [ ] Prepare user documentation for API setup
- [ ] Consider implementing a proxy server for API calls

## Troubleshooting

### Google TTS API Issues
- Verify billing is enabled
- Check API quota limits
- Ensure correct language codes (en-US, ja-JP)

### Freesound API Issues
- API key approval can take 24 hours
- Check daily request limits
- Verify search parameters

### Chrome Extension Issues
- Check manifest permissions for external hosts
- Verify CORS headers for API requests
- Test in different network conditions