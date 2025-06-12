# Text-to-Speech Implementation Guide

## Overview

The meditation extension uses Google Cloud Text-to-Speech API with SSML (Speech Synthesis Markup Language) to create natural, calming voice guidance for meditation sessions.

## Key Components

### 1. TTS Script Generator (`src/lib/tts-script-generator.js`)

Converts meditation scripts into SSML format with proper:
- **Pauses**: Carefully timed breaks for breathing and reflection
- **Prosody**: Speech rate, pitch, and volume optimized for meditation
- **Emphasis**: Key words highlighted for better guidance
- **Language Support**: English and Japanese with language-specific patterns

### 2. TTS Service (`src/lib/tts-service.js`)

Handles:
- API communication with Google Cloud TTS
- Audio caching for performance
- Offline fallback support
- Voice selection and configuration

### 3. Meditation Content (`src/lib/meditation-content.js`)

Provides structured meditation scripts with:
- Segment types (intro, instruction, guidance, reminder, outro, silence)
- Appropriate pause timings
- Natural phrasing for TTS conversion

## SSML Features Used

### Pauses and Timing

```xml
<!-- Short pause between phrases -->
<break time="500ms"/>

<!-- Breathing pause -->
<break time="3000ms"/>

<!-- Extended silence for meditation -->
<break time="30000ms"/>
```

### Prosody Control

```xml
<!-- Slow, calm speech for meditation -->
<prosody rate="0.8" pitch="-1st" volume="-2dB">
  Relax and breathe naturally.
</prosody>
```

### Emphasis

```xml
<!-- Emphasize important concepts -->
<emphasis level="moderate">present moment</emphasis>
```

### Language Support

```xml
<!-- English -->
<lang xml:lang="en-US">
  <prosody rate="0.8">Take a deep breath in...</prosody>
</lang>

<!-- Japanese -->
<lang xml:lang="ja-JP">
  <prosody rate="0.8">深く息を吸って...</prosody>
</lang>
```

## Breathing Instructions

Special handling for breathing cues:

### English Pattern
- "Take a deep breath in..." → Slower speech + 3s pause
- "Slowly release" → Very slow speech + 4s pause
- "Breathe in... breathe out..." → Natural pauses for breathing

### Japanese Pattern
- "深く息を吸って..." → Slower speech + 3s pause
- "ゆっくりと吐き出します" → Very slow speech + 4s pause
- "息を吸って... 息を吐いて..." → Natural pauses for breathing

## Voice Configuration

### Google Cloud TTS Voices

**English (en-US)**:
- Standard: en-US-Standard-C (neutral)
- WaveNet: en-US-Wavenet-C (higher quality)
- Neural2: en-US-Neural2-C (latest technology)

**Japanese (ja-JP)**:
- Standard: ja-JP-Standard-A (neutral)
- WaveNet: ja-JP-Wavenet-A (higher quality)
- Neural2: ja-JP-Neural2-A (latest technology)

### Recommended Settings

```javascript
{
  audioEncoding: 'MP3',
  speakingRate: 0.85,    // 15% slower than normal
  pitch: -1.0,           // Slightly lower pitch
  volumeGainDb: 0.0,     // Normal volume
  sampleRateHertz: 24000,
  effectsProfileId: ['headphone-class-device']
}
```

## Script Structure

Each meditation segment includes:

```javascript
{
  type: 'instruction',        // Segment type for prosody
  text: 'Take a deep breath', // The spoken text
  pauseAfter: 5000           // Pause after speaking (ms)
}
```

## Caching Strategy

1. **Memory Cache**: Active session audio in memory
2. **Storage Cache**: 7-day cache in Chrome storage
3. **Offline Fallback**: Pre-recorded audio files

## Usage Example

```javascript
// Generate SSML for a segment
const segment = {
  type: 'instruction',
  text: 'Breathe in... breathe out...',
  pauseAfter: 6000
};

const ssml = ttsScriptGenerator.generateSegmentSSML(segment, 'en');
// Output: <speak><lang xml:lang="en-US"><prosody rate="0.7" pitch="-1st" volume="0dB">Breathe in<break time="3000ms"/> breathe out<break time="4000ms"/></prosody></lang><break time="6000ms"/></speak>

// Generate audio
const audioData = await ttsService.generateSpeech(segment, 'en');
```

## Testing TTS Output

Run the test examples to see SSML generation:

```bash
node tests/tts-script-examples.js
```

## Best Practices

1. **Keep sentences short** - Easier to process and more natural pauses
2. **Use ellipsis** - Automatically converted to pauses
3. **Repeat key instructions** - Helps maintain meditation rhythm
4. **Balance speech and silence** - Don't overwhelm with constant talking
5. **Test with actual TTS** - SSML may render differently than expected

## Offline Mode

When API is unavailable:
1. Falls back to pre-recorded audio files
2. Uses silent audio for missing segments
3. Maintains session timing integrity

## Performance Optimization

1. **Pre-generate common phrases** during idle time
2. **Cache aggressively** - Audio rarely changes
3. **Batch API calls** when possible
4. **Use appropriate audio quality** - MP3 at 24kHz is sufficient

## Troubleshooting

### Common Issues

1. **Unnatural pauses**: Adjust `pauseAfter` values in segments
2. **Speech too fast**: Lower `speakingRate` below 0.85
3. **Robotic sound**: Use WaveNet or Neural2 voices
4. **Missing emphasis**: Add SSML emphasis tags
5. **API quota exceeded**: Implement better caching

### Debug Mode

Enable debug logging to see:
- Generated SSML
- API requests/responses
- Cache hit/miss rates
- Timing information