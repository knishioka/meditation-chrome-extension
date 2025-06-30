#!/usr/bin/env node

/**
 * Generate high-quality TTS audio using external APIs
 * This script uses actual TTS services for natural-sounding voices
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

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
 * Google Cloud Text-to-Speech API
 */
class GoogleTTSGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://texttospeech.googleapis.com/v1/text:synthesize';
  }

  async generateAudio(text, language, outputPath) {
    const voiceConfig = {
      en: {
        languageCode: 'en-US',
        name: 'en-US-Wavenet-F', // Natural female voice
        ssmlGender: 'FEMALE'
      },
      ja: {
        languageCode: 'ja-JP',
        name: 'ja-JP-Wavenet-A', // Natural female voice
        ssmlGender: 'FEMALE'
      }
    };

    const requestBody = {
      input: { text },
      voice: voiceConfig[language],
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.9, // Slightly slower for meditation
        pitch: -1.0, // Slightly lower pitch for calming effect
        effectsProfileId: ['headphone-class-device']
      }
    };

    return new Promise((resolve, reject) => {
      const postData = JSON.stringify(requestBody);
      
      const options = {
        hostname: 'texttospeech.googleapis.com',
        port: 443,
        path: `/v1/text:synthesize?key=${this.apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        
        res.on('data', (chunk) => {
          data += chunk;
        });
        
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            
            if (response.audioContent) {
              // Decode base64 audio
              const audioBuffer = Buffer.from(response.audioContent, 'base64');
              fs.writeFileSync(outputPath, audioBuffer);
              resolve({ success: true });
            } else {
              reject(new Error(response.error?.message || 'No audio content'));
            }
          } catch (error) {
            reject(error);
          }
        });
      });

      req.on('error', reject);
      req.write(postData);
      req.end();
    });
  }
}

/**
 * Microsoft Azure Speech Services
 */
class AzureTTSGenerator {
  constructor(apiKey, region) {
    this.apiKey = apiKey;
    this.region = region;
    this.endpoint = `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`;
  }

  async generateAudio(text, language, outputPath) {
    const voiceConfig = {
      en: 'en-US-JennyNeural', // Natural female voice
      ja: 'ja-JP-NanamiNeural' // Natural female voice
    };

    const ssml = `
<speak version='1.0' xml:lang='${language === 'en' ? 'en-US' : 'ja-JP'}'>
  <voice name='${voiceConfig[language]}'>
    <prosody rate='0.9' pitch='-5%'>
      ${text}
    </prosody>
  </voice>
</speak>`;

    return new Promise((resolve, reject) => {
      const options = {
        hostname: `${this.region}.tts.speech.microsoft.com`,
        port: 443,
        path: '/cognitiveservices/v1',
        method: 'POST',
        headers: {
          'Ocp-Apim-Subscription-Key': this.apiKey,
          'Content-Type': 'application/ssml+xml',
          'X-Microsoft-OutputFormat': 'audio-16khz-128kbitrate-mono-mp3',
          'User-Agent': 'MeditationApp'
        }
      };

      const req = https.request(options, (res) => {
        const chunks = [];
        
        res.on('data', (chunk) => {
          chunks.push(chunk);
        });
        
        res.on('end', () => {
          if (res.statusCode === 200) {
            const audioBuffer = Buffer.concat(chunks);
            fs.writeFileSync(outputPath, audioBuffer);
            resolve({ success: true });
          } else {
            reject(new Error(`Azure TTS failed: ${res.statusCode}`));
          }
        });
      });

      req.on('error', reject);
      req.write(ssml);
      req.end();
    });
  }
}

/**
 * ElevenLabs API (Ultra-realistic voices)
 */
class ElevenLabsTTSGenerator {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.endpoint = 'https://api.elevenlabs.io/v1/text-to-speech';
  }

  async generateAudio(text, language, outputPath) {
    // ElevenLabs voice IDs for meditation-appropriate voices
    const voiceIds = {
      en: '21m00Tcm4TlvDq8ikWAM', // Rachel - calm female voice
      ja: 'custom_japanese_voice' // Would need custom voice
    };

    const requestBody = {
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.75,
        similarity_boost: 0.75,
        style: 0.5,
        use_speaker_boost: true
      }
    };

    // Note: ElevenLabs requires different implementation
    // This is a simplified example
    console.log('ElevenLabs implementation would go here');
    return { success: false, message: 'Not implemented' };
  }
}

/**
 * Main function to generate all audio files
 */
async function generateAllAudio() {
  console.log('🎵 High-Quality TTS Audio Generation\n');

  // Check which API keys are available
  const apis = {
    google: process.env.GOOGLE_TTS_API_KEY,
    azure: process.env.AZURE_SPEECH_KEY,
    azureRegion: process.env.AZURE_SPEECH_REGION || 'eastus',
    elevenlabs: process.env.ELEVENLABS_API_KEY
  };

  let generator = null;
  
  if (apis.google) {
    console.log('✅ Using Google Cloud Text-to-Speech API');
    generator = new GoogleTTSGenerator(apis.google);
  } else if (apis.azure) {
    console.log('✅ Using Microsoft Azure Speech Services');
    generator = new AzureTTSGenerator(apis.azure, apis.azureRegion);
  } else {
    console.error('❌ No API keys found in environment variables');
    console.log('\nPlease set one of the following in .env.local:');
    console.log('- GOOGLE_TTS_API_KEY');
    console.log('- AZURE_SPEECH_KEY (and optionally AZURE_SPEECH_REGION)');
    console.log('\nAlternatively, use these free services manually:');
    console.log('1. TTSMaker.com - No API key required');
    console.log('2. NaturalReader.com - Free tier available');
    console.log('3. Play.ht - Free trial available');
    return;
  }

  // Generate audio for each language
  const languages = ['en', 'ja'];
  let generated = 0;
  let failed = 0;

  for (const lang of languages) {
    console.log(`\n🌐 Generating ${lang.toUpperCase()} audio files...`);
    
    const phrases = VOICE_AUDIO_MAP[lang];
    const texts = PHRASE_TEXTS[lang];
    
    for (const [key, filename] of Object.entries(phrases)) {
      const outputPath = path.join(__dirname, '..', 'public', 'audio', 'voice', lang, filename);
      const outputDir = path.dirname(outputPath);
      
      // Create directory if needed
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Skip if file exists
      if (fs.existsSync(outputPath)) {
        console.log(`✓ ${key}: Already exists`);
        continue;
      }
      
      const text = texts[key];
      if (!text) {
        console.log(`⚠️  ${key}: No text found`);
        continue;
      }
      
      try {
        console.log(`⏳ ${key}: Generating...`);
        await generator.generateAudio(text, lang, outputPath);
        console.log(`✅ ${key}: Generated successfully`);
        generated++;
        
        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error(`❌ ${key}: Failed - ${error.message}`);
        failed++;
      }
    }
  }

  console.log('\n📊 Generation Summary');
  console.log('--------------------');
  console.log(`✅ Generated: ${generated} files`);
  console.log(`❌ Failed: ${failed} files`);
}

// Instructions if no API key
function showManualInstructions() {
  console.log(`
# Manual TTS Generation Instructions

Since no API keys are configured, please generate audio manually:

## Option 1: TTSMaker.com (Recommended - Free)
1. Visit https://ttsmaker.com
2. For each phrase:
   - Select language (English or Japanese)
   - Choose voice:
     * English: "Aria" or "Jenny" (Female, Neural)
     * Japanese: "Nanami" or "Keita" (Natural sounding)
   - Set speed to 0.9
   - Enter the phrase text
   - Click "Convert to Speech"
   - Download as MP3

## Option 2: Google Cloud Console (Free Trial)
1. Visit https://cloud.google.com/text-to-speech
2. Use the demo interface
3. Select WaveNet voices for best quality

## Option 3: Amazon Polly Console (Free Tier)
1. Visit AWS Console > Amazon Polly
2. Use Neural voices for natural sound

## Voice Selection Guidelines
- Choose calm, neutral voices
- Prefer female voices for meditation
- Avoid overly energetic or dramatic voices
- Test with "Welcome to your meditation session"
`);
}

// Check for .env.local file
if (!fs.existsSync(path.join(__dirname, '..', '.env.local'))) {
  console.log('💡 Creating .env.local template...');
  const envTemplate = `# TTS API Configuration (for audio generation only)
# Choose one of the following:

# Google Cloud Text-to-Speech
GOOGLE_TTS_API_KEY=your_google_api_key_here

# Microsoft Azure Speech Services
AZURE_SPEECH_KEY=your_azure_key_here
AZURE_SPEECH_REGION=eastus

# ElevenLabs (premium voices)
ELEVENLABS_API_KEY=your_elevenlabs_key_here
`;
  fs.writeFileSync(path.join(__dirname, '..', '.env.local'), envTemplate);
  console.log('✅ Created .env.local - Please add your API keys');
  showManualInstructions();
} else {
  // Run the generation
  generateAllAudio().catch(console.error);
}