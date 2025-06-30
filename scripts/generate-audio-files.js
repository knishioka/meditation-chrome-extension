#!/usr/bin/env node

/**
 * Generate audio files using various TTS services
 * This script is for development/preparation only
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { exec } from 'child_process';
import { promisify } from 'util';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const CONFIG = {
  // Use TTSMaker API (free, no key required)
  ttsmaker: {
    endpoint: 'https://api.ttsmaker.com/v1/create-tts-order',
    // Note: In production, register for a free API token
    token: 'demo'
  },
  
  // Voice settings for meditation
  voiceSettings: {
    en: {
      voiceId: 'en-US-JennyNeural', // Calm female voice
      speed: 0.9,
      pitch: 0,
      volume: 0
    },
    ja: {
      voiceId: 'ja-JP-NanamiNeural', // Calm female voice
      speed: 0.9,
      pitch: 0,
      volume: 0
    }
  }
};

// Import phrases
import { VOICE_AUDIO_MAP } from '../src/lib/audio-mapping.js';

const PHRASE_TEXTS = {
  en: {
    'welcome': 'Welcome to your meditation session',
    'session_complete': 'Your meditation session is complete',
    'take_a_deep_breath': 'Take a deep breath',
    'breathe_in': 'Breathe in',
    'breathe_out': 'Breathe out',
    'hold_your_breath': 'Hold your breath',
    'relax': 'Relax',
    'focus_on_your_breath': 'Focus on your breath',
    'let_go': 'Let go',
    'be_present': 'Be present',
    'notice_your_feet': 'Notice your feet',
    'notice_your_legs': 'Notice your legs',
    'notice_your_stomach': 'Notice your stomach',
    'notice_your_chest': 'Notice your chest',
    'notice_your_shoulders': 'Notice your shoulders',
    'notice_your_arms': 'Notice your arms',
    'notice_your_hands': 'Notice your hands',
    'notice_your_neck': 'Notice your neck',
    'notice_your_face': 'Notice your face',
    'notice_your_head': 'Notice your head',
    'may_you_be_happy': 'May you be happy',
    'may_you_be_peaceful': 'May you be peaceful',
    'may_you_be_free': 'May you be free from suffering',
    'send_love_to_yourself': 'Send love to yourself',
    'send_love_to_others': 'Send love to others',
    'lets_begin': "Let's begin",
    'gently': 'Gently',
    'slowly': 'Slowly',
    'when_ready': 'When you are ready',
    'open_your_eyes': 'Open your eyes'
  },
  ja: {
    'welcome': 'ようこそ、瞑想セッションへ',
    'session_complete': '瞑想セッションが完了しました',
    'take_a_deep_breath': '深く息を吸ってください',
    'breathe_in': '息を吸って',
    'breathe_out': '息を吐いて',
    'hold_your_breath': '息を止めて',
    'relax': 'リラックスして',
    'focus_on_your_breath': '呼吸に意識を向けて',
    'let_go': '手放して',
    'be_present': '今この瞬間に意識を向けて',
    'notice_your_feet': '足に意識を向けて',
    'notice_your_legs': '脚に意識を向けて',
    'notice_your_stomach': 'お腹に意識を向けて',
    'notice_your_chest': '胸に意識を向けて',
    'notice_your_shoulders': '肩に意識を向けて',
    'notice_your_arms': '腕に意識を向けて',
    'notice_your_hands': '手に意識を向けて',
    'notice_your_neck': '首に意識を向けて',
    'notice_your_face': '顔に意識を向けて',
    'notice_your_head': '頭に意識を向けて',
    'may_you_be_happy': 'あなたが幸せでありますように',
    'may_you_be_peaceful': 'あなたが平和でありますように',
    'may_you_be_free': 'あなたが苦しみから解放されますように',
    'send_love_to_yourself': '自分自身に愛を送って',
    'send_love_to_others': '他の人に愛を送って',
    'lets_begin': '始めましょう',
    'gently': '優しく',
    'slowly': 'ゆっくりと',
    'when_ready': '準備ができたら',
    'open_your_eyes': '目を開けて'
  }
};

/**
 * Generate audio using browser automation (alternative approach)
 * This uses the system's TTS through a headless browser
 */
async function generateWithBrowserTTS(text, lang, outputPath) {
  // Create a temporary HTML file
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<script>
const utterance = new SpeechSynthesisUtterance("${text.replace(/"/g, '\\"')}");
utterance.lang = "${lang === 'en' ? 'en-US' : 'ja-JP'}";
utterance.rate = 0.9;
utterance.pitch = 1.0;
utterance.volume = 1.0;

// Try to select a good voice
const voices = speechSynthesis.getVoices();
const preferredVoice = voices.find(v => v.lang.startsWith("${lang}") && v.name.includes("Female"));
if (preferredVoice) utterance.voice = preferredVoice;

speechSynthesis.speak(utterance);

// Signal completion
utterance.onend = () => {
  document.title = "DONE";
};
</script>
</head>
<body>Generating TTS...</body>
</html>`;

  const tempHtmlPath = path.join(__dirname, 'temp-tts.html');
  fs.writeFileSync(tempHtmlPath, htmlContent);
  
  console.log(`Note: Browser TTS method requires manual recording.`);
  console.log(`Open ${tempHtmlPath} in a browser and use audio recording software.`);
  
  return { success: false, message: 'Manual recording required' };
}

/**
 * Generate silence audio file using FFmpeg
 */
async function generateSilence(durationSeconds, outputPath) {
  try {
    await execAsync(`ffmpeg -f lavfi -i anullsrc=r=44100:cl=mono -t ${durationSeconds} -acodec mp3 "${outputPath}" -y`);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Generate test tone using FFmpeg (placeholder for actual voice)
 */
async function generateTestTone(text, frequency, durationSeconds, outputPath) {
  try {
    // Generate a sine wave at the specified frequency
    await execAsync(`ffmpeg -f lavfi -i "sine=frequency=${frequency}:duration=${durationSeconds}" -acodec mp3 "${outputPath}" -y`);
    
    // Add metadata
    await execAsync(`ffmpeg -i "${outputPath}" -metadata title="${text}" -c copy "${outputPath}.tmp.mp3" -y`);
    fs.renameSync(`${outputPath}.tmp.mp3`, outputPath);
    
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Main generation function
 */
async function generateAudioFiles() {
  console.log('🎵 Audio File Generation Script\n');
  console.log('This script helps generate placeholder audio files for testing.\n');
  console.log('For production-quality audio, use one of these services:');
  console.log('1. TTSMaker.com - Free, no registration required');
  console.log('2. NaturalReader.com - Free tier available');
  console.log('3. PlayHT.com - High quality, free trial\n');
  
  // Check if FFmpeg is installed
  try {
    await execAsync('ffmpeg -version');
  } catch (error) {
    console.error('❌ FFmpeg is not installed. Please install it first:');
    console.error('   macOS: brew install ffmpeg');
    console.error('   Ubuntu: sudo apt-get install ffmpeg');
    console.error('   Windows: Download from https://ffmpeg.org/download.html');
    process.exit(1);
  }
  
  // Create output directories
  const languages = ['en', 'ja'];
  for (const lang of languages) {
    const voiceDir = path.join(__dirname, '..', 'public', 'audio', 'voice', lang);
    if (!fs.existsSync(voiceDir)) {
      fs.mkdirSync(voiceDir, { recursive: true });
    }
  }
  
  // Generate placeholder audio files
  console.log('\n📁 Generating placeholder audio files...\n');
  
  let generated = 0;
  let failed = 0;
  
  for (const lang of languages) {
    console.log(`\n🌐 Language: ${lang.toUpperCase()}`);
    console.log('------------------------');
    
    const phrases = VOICE_AUDIO_MAP[lang];
    const texts = PHRASE_TEXTS[lang];
    
    for (const [key, filename] of Object.entries(phrases)) {
      const outputPath = path.join(__dirname, '..', 'public', 'audio', 'voice', lang, filename);
      const text = texts[key] || key;
      
      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`✓ ${key}: Already exists`);
        generated++;
        continue;
      }
      
      // Generate placeholder audio (test tone with different frequencies)
      const frequency = 200 + (generated % 10) * 50; // Vary frequency
      const duration = 2; // 2 seconds for each phrase
      
      const result = await generateTestTone(text, frequency, duration, outputPath);
      
      if (result.success) {
        console.log(`✓ ${key}: Generated placeholder`);
        generated++;
      } else {
        console.log(`✗ ${key}: Failed - ${result.error}`);
        failed++;
      }
    }
  }
  
  // Generate background music placeholders
  console.log('\n🎵 Generating background music placeholders...\n');
  
  const bgMusicDir = path.join(__dirname, '..', 'public', 'audio', 'background');
  
  // Nature sounds (30 minutes of silence as placeholder)
  const natureSounds = ['nature/rain-30min.mp3', 'nature/ocean-30min.mp3', 'nature/forest-30min.mp3'];
  for (const sound of natureSounds) {
    const outputPath = path.join(bgMusicDir, sound);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(outputPath)) {
      const result = await generateSilence(1800, outputPath); // 30 minutes
      if (result.success) {
        console.log(`✓ ${sound}: Generated placeholder`);
        generated++;
      } else {
        console.log(`✗ ${sound}: Failed`);
        failed++;
      }
    } else {
      console.log(`✓ ${sound}: Already exists`);
      generated++;
    }
  }
  
  // Ambient music (30 minutes of low frequency tone)
  const ambientMusic = ['ambient/calm-meditation-30min.mp3', 'ambient/peaceful-meditation-30min.mp3'];
  for (const music of ambientMusic) {
    const outputPath = path.join(bgMusicDir, music);
    const outputDir = path.dirname(outputPath);
    
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    if (!fs.existsSync(outputPath)) {
      const result = await generateTestTone('Ambient Music', 60, 1800, outputPath); // 60Hz, 30 minutes
      if (result.success) {
        console.log(`✓ ${music}: Generated placeholder`);
        generated++;
      } else {
        console.log(`✗ ${music}: Failed`);
        failed++;
      }
    } else {
      console.log(`✓ ${music}: Already exists`);
      generated++;
    }
  }
  
  // Generate silence file
  const silencePath = path.join(bgMusicDir, 'silence-30min.mp3');
  if (!fs.existsSync(silencePath)) {
    const result = await generateSilence(1800, silencePath);
    if (result.success) {
      console.log(`✓ silence-30min.mp3: Generated`);
      generated++;
    } else {
      console.log(`✗ silence-30min.mp3: Failed`);
      failed++;
    }
  }
  
  // Summary
  console.log('\n📊 Generation Summary');
  console.log('--------------------');
  console.log(`✓ Generated: ${generated} files`);
  console.log(`✗ Failed: ${failed} files`);
  console.log('\n⚠️  Note: These are placeholder files for testing only!');
  console.log('For production, please generate real audio files using:');
  console.log('1. Visit TTSMaker.com');
  console.log('2. Use the phrase list in scripts/audio-generation/voice-phrases.csv');
  console.log('3. Download MP3 files and replace the placeholders');
  
  // Create instruction file
  const instructions = `# Audio File Generation Instructions

## Generated Placeholder Files
This script has created placeholder audio files for testing the extension.
These are simple test tones and silence, NOT actual meditation audio.

## How to Generate Real Audio Files

### Voice Guidance (TTS)
1. Visit https://ttsmaker.com
2. For each phrase in the CSV file:
   - Select the appropriate language
   - Choose a calm, meditation-appropriate voice
   - Set speed to 0.9x
   - Enter the phrase text
   - Generate and download as MP3
   - Save with the exact filename from the CSV

### Background Music
1. **Nature Sounds**: 
   - Use https://mynoise.net to create custom soundscapes
   - Or find royalty-free nature recordings
   
2. **Ambient Music**:
   - Use https://zenmix.io for meditation music
   - Or https://www.ambient-mixer.com
   
3. **Requirements**:
   - Duration: 30 minutes minimum
   - Format: MP3, 128-192kbps
   - License: Royalty-free or CC0

## File Naming
Maintain exact filenames as specified in audio-mapping.js

## Testing
After replacing placeholder files:
1. Load the extension in Chrome
2. Test each meditation type
3. Verify audio plays correctly
`;
  
  fs.writeFileSync(path.join(__dirname, 'audio-generation', 'INSTRUCTIONS.md'), instructions);
  console.log('\n📄 Instructions saved to: scripts/audio-generation/INSTRUCTIONS.md');
}

// Run the script
generateAudioFiles().catch(console.error);