import ttsScriptGenerator from '@lib/tts-script-generator';
import { LANGUAGES } from '@config/constants';

/**
 * TTS Script Examples
 * Demonstrates how meditation scripts are converted to SSML for natural TTS output
 */

// Example 1: Basic breathing instruction in English
const breathingExample = {
  type: 'instruction',
  text: 'Take a deep breath in... and slowly release.',
  pauseAfter: 5000,
};

console.log('=== Breathing Instruction (English) ===');
console.log('Original text:', breathingExample.text);
console.log('SSML output:');
console.log(ttsScriptGenerator.generateSegmentSSML(breathingExample, LANGUAGES.EN));
console.log('\n');

// Example 2: Japanese breathing instruction
const breathingExampleJA = {
  type: 'instruction',
  text: '深く息を吸って... ゆっくりと吐き出します。',
  pauseAfter: 5000,
};

console.log('=== Breathing Instruction (Japanese) ===');
console.log('Original text:', breathingExampleJA.text);
console.log('SSML output:');
console.log(ttsScriptGenerator.generateSegmentSSML(breathingExampleJA, LANGUAGES.JA));
console.log('\n');

// Example 3: Complex guidance with multiple pauses
const guidanceExample = {
  type: 'guidance',
  text: 'Notice the sensation of your breath. Feel the cool air as you breathe in. Feel the warm air as you breathe out.',
  pauseAfter: 10000,
};

console.log('=== Guidance with Multiple Sentences (English) ===');
console.log('Original text:', guidanceExample.text);
console.log('SSML output:');
console.log(ttsScriptGenerator.generateSegmentSSML(guidanceExample, LANGUAGES.EN));
console.log('\n');

// Example 4: Meditation intro with emphasis
const introExample = {
  type: 'intro',
  text: 'Welcome to your meditation session. Find a comfortable position and relax.',
  pauseAfter: 3000,
};

console.log('=== Intro with Emphasis ===');
console.log('Original text:', introExample.text);
console.log('SSML output:');
console.log(ttsScriptGenerator.generateSegmentSSML(introExample, LANGUAGES.EN));
console.log('\n');

// Example 5: Full breathing sequence
const breathingSequence = [
  {
    type: 'instruction',
    text: 'Let\'s begin with three deep breaths.',
    pauseAfter: 2000,
  },
  {
    type: 'instruction',
    text: 'Breathe in... breathe out...',
    pauseAfter: 6000,
  },
  {
    type: 'instruction',
    text: 'Breathe in... breathe out...',
    pauseAfter: 6000,
  },
  {
    type: 'instruction',
    text: 'One more time. Breathe in... and let it go.',
    pauseAfter: 6000,
  },
  {
    type: 'guidance',
    text: 'Now return to your natural breathing rhythm.',
    pauseAfter: 5000,
  },
];

console.log('=== Full Breathing Sequence ===');
console.log('Converting a complete breathing exercise:\n');

breathingSequence.forEach((segment, index) => {
  console.log(`Segment ${index + 1}: ${segment.text}`);
  console.log('SSML:', ttsScriptGenerator.generateSegmentSSML(segment, LANGUAGES.EN));
  console.log('---');
});

// Example 6: Silence periods
const silenceExample = {
  type: 'silence',
  text: '',
  pauseAfter: 30000, // 30 seconds of silence
};

console.log('\n=== Silence Period ===');
console.log('30 seconds of meditation silence');
console.log('SSML output:');
console.log(ttsScriptGenerator.generateSegmentSSML(silenceExample, LANGUAGES.EN));
console.log('\n');

// Example 7: Key meditation phrases with proper timing
const keyPhrases = {
  en: [
    'Breathe in through your nose... and out through your mouth.',
    'Notice any thoughts that arise, and gently let them go.',
    'Return your attention to the present moment.',
    'Feel your body becoming more and more relaxed.',
  ],
  ja: [
    '鼻から息を吸って... 口から吐き出します。',
    '浮かんでくる思考に気づいたら、そっと手放してください。',
    '今この瞬間に注意を戻します。',
    '体がどんどんリラックスしていくのを感じてください。',
  ],
};

console.log('=== Key Meditation Phrases ===');
Object.entries(keyPhrases).forEach(([lang, phrases]) => {
  console.log(`\n${lang.toUpperCase()} phrases:`);
  phrases.forEach((phrase, index) => {
    const segment = {
      type: 'guidance',
      text: phrase,
      pauseAfter: 5000,
    };
    console.log(`${index + 1}. ${phrase}`);
    console.log('   SSML preview:', ttsScriptGenerator.generateSegmentSSML(segment, lang).substring(0, 100) + '...');
  });
});

// Example 8: Test the full session generation
console.log('\n=== Full Session Test ===');
const testScript = {
  segments: [
    {
      type: 'intro',
      text: 'Welcome. Let\'s begin.',
      pauseAfter: 2000,
    },
    {
      type: 'instruction',
      text: 'Take a deep breath in... and release.',
      pauseAfter: 5000,
    },
    {
      type: 'silence',
      text: '',
      pauseAfter: 10000,
    },
    {
      type: 'outro',
      text: 'Thank you for meditating.',
      pauseAfter: 2000,
    },
  ],
};

const fullSessionSSML = ttsScriptGenerator.generateFullSessionSSML(testScript, LANGUAGES.EN);
console.log('Number of SSML segments:', fullSessionSSML.length);
console.log('Total approximate duration:', 
  testScript.segments.reduce((sum, seg) => sum + seg.pauseAfter, 0) / 1000, 'seconds');

// Export function to run specific tests
export function testTTSGeneration(language = LANGUAGES.EN) {
  console.log(`\n=== Testing TTS Generation for ${language} ===`);
  const testSSML = ttsScriptGenerator.generateTestSSML(language);
  testSSML.forEach((ssml, index) => {
    console.log(`Test segment ${index + 1}:`);
    console.log(ssml);
    console.log('');
  });
}

// Run tests if this file is executed directly
if (require.main === module) {
  console.log('Running TTS Script Examples...\n');
  testTTSGeneration(LANGUAGES.EN);
  testTTSGeneration(LANGUAGES.JA);
}