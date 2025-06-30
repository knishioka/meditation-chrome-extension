# Audio Resource Generation Guide

This guide explains how to generate all the audio resources needed for the Meditation Chrome Extension. Since the extension works completely offline, all audio files must be generated and included before distribution.

## 📋 Overview

The extension requires two types of audio resources:
1. **Voice Guidance**: Meditation instructions in English and Japanese
2. **Background Audio**: Nature sounds and ambient music

Total files needed: ~170 voice files + 6 background tracks

## 🎯 Quick Start

### Option 1: Using Free Online Tools (Recommended)

1. **Generate the file list**:
   ```bash
   npm run generate:audio-list
   ```

2. **Open the generation report**:
   ```bash
   open scripts/audio-generation/audio-generation-report.md
   ```

3. **Use TTSMaker.com** for voice generation:
   - Visit [https://ttsmaker.com](https://ttsmaker.com)
   - No registration required
   - Supports both English and Japanese

### Option 2: Automated Generation with APIs

1. **Set up API credentials**:
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your API keys
   ```

2. **Run automated generation**:
   ```bash
   npm run generate:tts-api
   ```

## 🎤 Voice Generation Details

### Required Voice Files

Each language needs approximately 30 phrase files:

| Category | Phrases | Examples |
|----------|---------|----------|
| Common | 10 | "Welcome", "Breathe in", "Relax" |
| Body Scan | 10 | "Notice your feet", "Notice your shoulders" |
| Loving Kindness | 5 | "May you be happy", "Send love to yourself" |
| Transitions | 5 | "Gently", "When ready", "Let's begin" |

### Voice Selection Guidelines

#### English Voices
- **Recommended**: Jenny (Neural), Aria, or Guy
- **Characteristics**: Calm, neutral, clear
- **Avoid**: Overly enthusiastic or dramatic voices

#### Japanese Voices
- **Recommended**: Nanami, Keita, or Tomoko
- **Characteristics**: 落ち着いた、やさしい声
- **Avoid**: アニメ声や子供っぽい声

### TTS Settings

Optimal settings for meditation audio:
```javascript
{
  speed: 0.9,        // Slightly slower than normal
  pitch: -1.0,       // Slightly lower for calming effect
  volume: 0.8,       // Not too loud
  pauseLength: 1.5   // Longer pauses between sentences
}
```

## 🎵 Background Music Generation

### Required Background Files

| Type | Files | Duration | Description |
|------|-------|----------|-------------|
| Nature | 3 | 30 min each | Rain, Ocean, Forest |
| Ambient | 2 | 30 min each | Calm meditation music |
| Silence | 1 | 30 min | Silent track for "no background" option |

### Music Generation Tools

#### Free Options

1. **ZENmix.io**
   - Custom meditation music generator
   - Export as WAV/MP3
   - No copyright issues

2. **MyNoise.net**
   - Nature sound generator
   - Customizable soundscapes
   - Can record output

3. **Mubert.com**
   - AI-generated ambient music
   - Royalty-free options
   - Meditation presets

#### Recording Natural Sounds

For authentic nature sounds:
1. Use a field recorder or smartphone
2. Record in quiet natural settings
3. Edit with Audacity (free) to create loops

### Audio Format Requirements

```javascript
// Voice files
{
  format: "MP3",
  bitrate: "128kbps",
  channels: "Mono",
  sampleRate: "44.1kHz"
}

// Background music
{
  format: "MP3",
  bitrate: "192kbps",
  channels: "Stereo",
  sampleRate: "44.1kHz"
}
```

## 🛠️ Generation Scripts

### 1. Audio List Generator
```bash
node scripts/generate-audio-list.js
```

Outputs:
- `voice-phrases.csv`: All phrases with translations
- `background-music.csv`: Required music files
- `audio-generation-report.md`: Status report

### 2. Test Audio Generator
```bash
node scripts/generate-audio-files.js
```

Creates placeholder files for testing (requires FFmpeg).

### 3. TTS API Generator
```bash
node scripts/generate-tts-with-api.js
```

Supports:
- Google Cloud Text-to-Speech
- Microsoft Azure Speech
- Amazon Polly

## 📝 Step-by-Step Process

### Phase 1: Preparation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate file lists**:
   ```bash
   npm run generate:audio-list
   ```

3. **Review requirements**:
   - Check `scripts/audio-generation/voice-phrases.csv`
   - Note which files are already generated

### Phase 2: Voice Generation

#### Manual Process (TTSMaker)

1. **Go to TTSMaker.com**
2. **For each phrase in the CSV**:
   - Select the language
   - Choose appropriate voice
   - Enter the phrase text
   - Set speed to 0.9
   - Generate and download
   - Save with exact filename from CSV

#### Batch Process Tips

- Create a tracking spreadsheet
- Work in batches of 10 phrases
- Test first phrase in each language
- Maintain consistent voice selection

### Phase 3: Background Music

1. **Nature Sounds**:
   ```
   - rain-30min.mp3: Steady rain without thunder
   - ocean-30min.mp3: Gentle waves, no seagulls
   - forest-30min.mp3: Birds and wind, subtle
   ```

2. **Ambient Music**:
   ```
   - calm-meditation-30min.mp3: Soft, no sudden changes
   - peaceful-meditation-30min.mp3: Minimal, atmospheric
   ```

3. **Silence Track**:
   ```bash
   # Generate with FFmpeg
   ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 1800 -acodec mp3 silence-30min.mp3
   ```

### Phase 4: Quality Check

1. **Validate all files exist**:
   ```bash
   npm run validate:audio
   ```

2. **Test in extension**:
   - Load extension in Chrome
   - Try each meditation type
   - Test both languages
   - Verify all audio plays correctly

## 🔧 Troubleshooting

### Common Issues

**"File not found" errors**:
- Check filename matches exactly (case-sensitive)
- Ensure file is in correct directory
- Verify file extension is .mp3

**Audio quality issues**:
- Re-export with recommended settings
- Check for clipping or distortion
- Ensure consistent volume levels

**Large file sizes**:
- Compress with FFmpeg:
  ```bash
  ffmpeg -i input.mp3 -b:a 128k output.mp3
  ```

### FFmpeg Commands

```bash
# Convert WAV to MP3
ffmpeg -i input.wav -acodec mp3 -b:a 128k output.mp3

# Normalize volume
ffmpeg -i input.mp3 -af loudnorm output.mp3

# Trim audio
ffmpeg -i input.mp3 -ss 00:00:00 -t 00:30:00 output.mp3

# Create silence
ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t 10 silence.mp3
```

## 📊 File Organization

Final structure:
```
public/audio/
├── voice/
│   ├── en/
│   │   ├── welcome.mp3
│   │   ├── breathe-in.mp3
│   │   └── ... (30 files)
│   └── ja/
│       ├── welcome.mp3
│       ├── breathe-in.mp3
│       └── ... (30 files)
└── background/
    ├── nature/
    │   ├── rain-30min.mp3
    │   ├── ocean-30min.mp3
    │   └── forest-30min.mp3
    ├── ambient/
    │   ├── calm-meditation-30min.mp3
    │   └── peaceful-meditation-30min.mp3
    └── silence-30min.mp3
```

## ✅ Checklist

Before considering audio generation complete:

- [ ] All voice phrases generated for English
- [ ] All voice phrases generated for Japanese
- [ ] Voice files are consistently named
- [ ] Background music files are 30 minutes each
- [ ] All files are in MP3 format
- [ ] File sizes are optimized (<1MB for voice, <15MB for music)
- [ ] Audio levels are consistent
- [ ] Tested all files in the extension
- [ ] No copyrighted content used
- [ ] Generation documentation updated

## 🎯 Best Practices

1. **Consistency**: Use the same voice throughout
2. **Quality**: Better to have fewer high-quality files
3. **Testing**: Always test in the actual extension
4. **Backup**: Keep original high-quality versions
5. **Documentation**: Note any special considerations

## 📚 Additional Resources

- [TTSMaker.com](https://ttsmaker.com) - Free TTS
- [FFmpeg Documentation](https://ffmpeg.org/documentation.html)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Audacity](https://www.audacityteam.org/) - Free audio editor

## 🤝 Contributing Audio

If you want to contribute audio files:

1. Follow the naming convention exactly
2. Use the recommended audio settings
3. Test thoroughly before submitting
4. Include generation notes
5. Ensure files are copyright-free

---

For questions or issues with audio generation, please check the [GitHub Issues](https://github.com/yourusername/meditation-chrome-extension/issues) or contact the maintainers.