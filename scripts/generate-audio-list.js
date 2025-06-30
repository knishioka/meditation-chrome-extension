#!/usr/bin/env node

/**
 * Generate audio phrase list from audio-mapping.js
 * This script creates a CSV file with all phrases that need to be generated
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import the audio mapping
import { VOICE_AUDIO_MAP, BACKGROUND_AUDIO_MAP } from '../src/lib/audio-mapping.js';

// Translation mapping for Japanese phrases
const PHRASE_TRANSLATIONS = {
  // Common phrases
  'welcome': { en: 'Welcome to your meditation session', ja: 'ようこそ、瞑想セッションへ' },
  'session_complete': { en: 'Your meditation session is complete', ja: '瞑想セッションが完了しました' },
  'take_a_deep_breath': { en: 'Take a deep breath', ja: '深く息を吸ってください' },
  'breathe_in': { en: 'Breathe in', ja: '息を吸って' },
  'breathe_out': { en: 'Breathe out', ja: '息を吐いて' },
  'hold_your_breath': { en: 'Hold your breath', ja: '息を止めて' },
  'relax': { en: 'Relax', ja: 'リラックスして' },
  'focus_on_your_breath': { en: 'Focus on your breath', ja: '呼吸に意識を向けて' },
  'let_go': { en: 'Let go', ja: '手放して' },
  'be_present': { en: 'Be present', ja: '今この瞬間に意識を向けて' },
  
  // Body scan phrases
  'notice_your_feet': { en: 'Notice your feet', ja: '足に意識を向けて' },
  'notice_your_legs': { en: 'Notice your legs', ja: '脚に意識を向けて' },
  'notice_your_stomach': { en: 'Notice your stomach', ja: 'お腹に意識を向けて' },
  'notice_your_chest': { en: 'Notice your chest', ja: '胸に意識を向けて' },
  'notice_your_shoulders': { en: 'Notice your shoulders', ja: '肩に意識を向けて' },
  'notice_your_arms': { en: 'Notice your arms', ja: '腕に意識を向けて' },
  'notice_your_hands': { en: 'Notice your hands', ja: '手に意識を向けて' },
  'notice_your_neck': { en: 'Notice your neck', ja: '首に意識を向けて' },
  'notice_your_face': { en: 'Notice your face', ja: '顔に意識を向けて' },
  'notice_your_head': { en: 'Notice your head', ja: '頭に意識を向けて' },
  
  // Loving kindness phrases
  'may_you_be_happy': { en: 'May you be happy', ja: 'あなたが幸せでありますように' },
  'may_you_be_peaceful': { en: 'May you be peaceful', ja: 'あなたが平和でありますように' },
  'may_you_be_free': { en: 'May you be free from suffering', ja: 'あなたが苦しみから解放されますように' },
  'send_love_to_yourself': { en: 'Send love to yourself', ja: '自分自身に愛を送って' },
  'send_love_to_others': { en: 'Send love to others', ja: '他の人に愛を送って' },
  
  // Transition phrases
  'lets_begin': { en: "Let's begin", ja: '始めましょう' },
  'gently': { en: 'Gently', ja: '優しく' },
  'slowly': { en: 'Slowly', ja: 'ゆっくりと' },
  'when_ready': { en: 'When you are ready', ja: '準備ができたら' },
  'open_your_eyes': { en: 'Open your eyes', ja: '目を開けて' }
};

function generateVoicePhraseList() {
  const phrases = [];
  
  // Generate list for each language
  ['en', 'ja'].forEach(lang => {
    const languageMap = VOICE_AUDIO_MAP[lang];
    
    Object.entries(languageMap).forEach(([phraseKey, filename]) => {
      const translation = PHRASE_TRANSLATIONS[phraseKey];
      const text = translation ? translation[lang] : phraseKey.replace(/_/g, ' ');
      
      phrases.push({
        phraseKey,
        language: lang,
        text,
        filename,
        filepath: `public/audio/voice/${lang}/${filename}`,
        generated: fs.existsSync(path.join(__dirname, '..', 'public', 'audio', 'voice', lang, filename))
      });
    });
  });
  
  return phrases;
}

function generateBackgroundMusicList() {
  const music = [];
  
  Object.entries(BACKGROUND_AUDIO_MAP).forEach(([key, filepath]) => {
    const fullPath = `public/audio/background/${filepath}`;
    music.push({
      key,
      type: key.includes('rain') || key.includes('ocean') || key.includes('forest') ? 'nature' : 
            key.includes('ambient') ? 'ambient' : 'silence',
      filename: path.basename(filepath),
      filepath: fullPath,
      duration: '30min',
      generated: fs.existsSync(path.join(__dirname, '..', fullPath))
    });
  });
  
  return music;
}

function generateCSV(phrases, music) {
  // Voice phrases CSV
  const voiceHeaders = ['Phrase Key', 'Language', 'Text', 'Filename', 'File Path', 'Generated'];
  const voiceRows = phrases.map(p => [
    p.phraseKey,
    p.language,
    `"${p.text}"`,
    p.filename,
    p.filepath,
    p.generated ? 'YES' : 'NO'
  ]);
  
  const voiceCSV = [voiceHeaders, ...voiceRows].map(row => row.join(',')).join('\n');
  
  // Background music CSV
  const musicHeaders = ['Key', 'Type', 'Filename', 'File Path', 'Duration', 'Generated'];
  const musicRows = music.map(m => [
    m.key,
    m.type,
    m.filename,
    m.filepath,
    m.duration,
    m.generated ? 'YES' : 'NO'
  ]);
  
  const musicCSV = [musicHeaders, ...musicRows].map(row => row.join(',')).join('\n');
  
  return { voiceCSV, musicCSV };
}

function generateMarkdownReport(phrases, music) {
  const enPhrases = phrases.filter(p => p.language === 'en');
  const jaPhrases = phrases.filter(p => p.language === 'ja');
  
  const enGenerated = enPhrases.filter(p => p.generated).length;
  const jaGenerated = jaPhrases.filter(p => p.generated).length;
  const musicGenerated = music.filter(m => m.generated).length;
  
  let report = '# Audio Generation Report\n\n';
  report += `Generated: ${new Date().toISOString()}\n\n`;
  
  report += '## Summary\n\n';
  report += `- English phrases: ${enGenerated}/${enPhrases.length} (${Math.round(enGenerated/enPhrases.length*100)}%)\n`;
  report += `- Japanese phrases: ${jaGenerated}/${jaPhrases.length} (${Math.round(jaGenerated/jaPhrases.length*100)}%)\n`;
  report += `- Background music: ${musicGenerated}/${music.length} (${Math.round(musicGenerated/music.length*100)}%)\n`;
  report += `- Total files needed: ${enPhrases.length + jaPhrases.length + music.length}\n`;
  report += `- Total files generated: ${enGenerated + jaGenerated + musicGenerated}\n\n`;
  
  report += '## Missing Voice Files\n\n';
  report += '### English\n';
  enPhrases.filter(p => !p.generated).forEach(p => {
    report += `- [ ] ${p.phraseKey}: "${p.text}" → ${p.filename}\n`;
  });
  
  report += '\n### Japanese\n';
  jaPhrases.filter(p => !p.generated).forEach(p => {
    report += `- [ ] ${p.phraseKey}: "${p.text}" → ${p.filename}\n`;
  });
  
  report += '\n## Missing Background Music\n\n';
  music.filter(m => !m.generated).forEach(m => {
    report += `- [ ] ${m.key} (${m.type}): ${m.filename}\n`;
  });
  
  report += '\n## Generation Instructions\n\n';
  report += '### Voice Generation (TTSMaker.com)\n';
  report += '1. Go to https://ttsmaker.com\n';
  report += '2. Select language (English or Japanese)\n';
  report += '3. Choose a calm, meditation-appropriate voice\n';
  report += '4. Set speed to 0.9x for better pacing\n';
  report += '5. Generate and download as MP3\n\n';
  
  report += '### Music Generation\n';
  report += '1. **Nature sounds**: Use https://mynoise.net or record real sounds\n';
  report += '2. **Ambient music**: Use https://zenmix.io or https://mubert.com\n';
  report += '3. Duration: 30 minutes minimum\n';
  report += '4. Format: MP3, 128-192kbps\n';
  
  return report;
}

// Main execution
function main() {
  console.log('Generating audio file lists...\n');
  
  const phrases = generateVoicePhraseList();
  const music = generateBackgroundMusicList();
  
  // Create output directory
  const outputDir = path.join(__dirname, 'audio-generation');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Generate CSV files
  const { voiceCSV, musicCSV } = generateCSV(phrases, music);
  fs.writeFileSync(path.join(outputDir, 'voice-phrases.csv'), voiceCSV);
  fs.writeFileSync(path.join(outputDir, 'background-music.csv'), musicCSV);
  
  // Generate markdown report
  const report = generateMarkdownReport(phrases, music);
  fs.writeFileSync(path.join(outputDir, 'audio-generation-report.md'), report);
  
  // Print summary
  console.log('📊 Audio Generation Summary:');
  console.log(`- Total voice phrases: ${phrases.length}`);
  console.log(`- Total background music: ${music.length}`);
  console.log(`- Files already generated: ${phrases.filter(p => p.generated).length + music.filter(m => m.generated).length}`);
  console.log(`- Files to generate: ${phrases.filter(p => !p.generated).length + music.filter(m => !m.generated).length}`);
  console.log('\n📁 Output files:');
  console.log(`- ${outputDir}/voice-phrases.csv`);
  console.log(`- ${outputDir}/background-music.csv`);
  console.log(`- ${outputDir}/audio-generation-report.md`);
}

main();