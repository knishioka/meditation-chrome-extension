/**
 * Audio mapping module for offline meditation audio files
 */

// Voice phrase to audio file mapping
export const VOICE_AUDIO_MAP = {
  en: {
    // Common phrases
    'welcome': 'welcome.mp3',
    'session_complete': 'session-complete.mp3',
    'take_a_deep_breath': 'take-deep-breath.mp3',
    'breathe_in': 'breathe-in.mp3',
    'breathe_out': 'breathe-out.mp3',
    'hold_your_breath': 'hold-breath.mp3',
    'relax': 'relax.mp3',
    'focus_on_your_breath': 'focus-breath.mp3',
    'let_go': 'let-go.mp3',
    'be_present': 'be-present.mp3',
    
    // Body scan phrases
    'notice_your_feet': 'notice-feet.mp3',
    'notice_your_legs': 'notice-legs.mp3',
    'notice_your_stomach': 'notice-stomach.mp3',
    'notice_your_chest': 'notice-chest.mp3',
    'notice_your_shoulders': 'notice-shoulders.mp3',
    'notice_your_arms': 'notice-arms.mp3',
    'notice_your_hands': 'notice-hands.mp3',
    'notice_your_neck': 'notice-neck.mp3',
    'notice_your_face': 'notice-face.mp3',
    'notice_your_head': 'notice-head.mp3',
    
    // Loving kindness phrases
    'may_you_be_happy': 'may-you-be-happy.mp3',
    'may_you_be_peaceful': 'may-you-be-peaceful.mp3',
    'may_you_be_free': 'may-you-be-free.mp3',
    'send_love_to_yourself': 'send-love-yourself.mp3',
    'send_love_to_others': 'send-love-others.mp3',
    
    // Transition phrases
    'lets_begin': 'lets-begin.mp3',
    'gently': 'gently.mp3',
    'slowly': 'slowly.mp3',
    'when_ready': 'when-ready.mp3',
    'open_your_eyes': 'open-eyes.mp3'
  },
  ja: {
    // Common phrases
    'welcome': 'welcome.mp3',
    'session_complete': 'session-complete.mp3',
    'take_a_deep_breath': 'take-deep-breath.mp3',
    'breathe_in': 'breathe-in.mp3',
    'breathe_out': 'breathe-out.mp3',
    'hold_your_breath': 'hold-breath.mp3',
    'relax': 'relax.mp3',
    'focus_on_your_breath': 'focus-breath.mp3',
    'let_go': 'let-go.mp3',
    'be_present': 'be-present.mp3',
    
    // Body scan phrases
    'notice_your_feet': 'notice-feet.mp3',
    'notice_your_legs': 'notice-legs.mp3',
    'notice_your_stomach': 'notice-stomach.mp3',
    'notice_your_chest': 'notice-chest.mp3',
    'notice_your_shoulders': 'notice-shoulders.mp3',
    'notice_your_arms': 'notice-arms.mp3',
    'notice_your_hands': 'notice-hands.mp3',
    'notice_your_neck': 'notice-neck.mp3',
    'notice_your_face': 'notice-face.mp3',
    'notice_your_head': 'notice-head.mp3',
    
    // Loving kindness phrases
    'may_you_be_happy': 'may-you-be-happy.mp3',
    'may_you_be_peaceful': 'may-you-be-peaceful.mp3',
    'may_you_be_free': 'may-you-be-free.mp3',
    'send_love_to_yourself': 'send-love-yourself.mp3',
    'send_love_to_others': 'send-love-others.mp3',
    
    // Transition phrases
    'lets_begin': 'lets-begin.mp3',
    'gently': 'gently.mp3',
    'slowly': 'slowly.mp3',
    'when_ready': 'when-ready.mp3',
    'open_your_eyes': 'open-eyes.mp3'
  }
};

// Background music mapping
export const BACKGROUND_AUDIO_MAP = {
  'rain': 'nature/rain-30min.mp3',
  'ocean': 'nature/ocean-30min.mp3',
  'forest': 'nature/forest-30min.mp3',
  'ambient-1': 'ambient/calm-meditation-30min.mp3',
  'ambient-2': 'ambient/peaceful-meditation-30min.mp3',
  'silence': 'silence-30min.mp3'
};

/**
 * Get the audio file path for a voice phrase
 * @param {string} phraseKey - The phrase key to look up
 * @param {string} language - The language code ('en' or 'ja')
 * @returns {string|null} The relative path to the audio file or null if not found
 */
export function getVoiceAudioPath(phraseKey, language) {
  const languageMap = VOICE_AUDIO_MAP[language];
  if (!languageMap || !languageMap[phraseKey]) {
    console.warn(`Audio file not found for phrase: ${phraseKey} in language: ${language}`);
    return null;
  }
  return `audio/voice/${language}/${languageMap[phraseKey]}`;
}

/**
 * Get the audio file path for background music
 * @param {string} musicKey - The music key to look up
 * @returns {string|null} The relative path to the audio file or null if not found
 */
export function getBackgroundAudioPath(musicKey) {
  if (!BACKGROUND_AUDIO_MAP[musicKey]) {
    console.warn(`Background audio not found for key: ${musicKey}`);
    return null;
  }
  return `audio/background/${BACKGROUND_AUDIO_MAP[musicKey]}`;
}

/**
 * Parse text to find matching audio phrases
 * @param {string} text - The text to parse
 * @param {string} language - The language code
 * @returns {Array<string>} Array of audio file paths
 */
export function parseTextToAudioPaths(text, language) {
  const paths = [];
  const languageMap = VOICE_AUDIO_MAP[language];
  
  if (!languageMap) {
    console.warn(`Language not supported: ${language}`);
    return paths;
  }
  
  // Simple implementation - in production, would need more sophisticated parsing
  // This checks if the text contains any of our phrase keys
  Object.keys(languageMap).forEach(phraseKey => {
    // Convert phrase key to readable text (e.g., 'breathe_in' -> 'breathe in')
    const phraseText = phraseKey.replace(/_/g, ' ');
    if (text.toLowerCase().includes(phraseText)) {
      const path = getVoiceAudioPath(phraseKey, language);
      if (path) {
        paths.push(path);
      }
    }
  });
  
  return paths;
}

/**
 * Get a random background music option
 * @param {string} type - The type of background ('nature' or 'ambient')
 * @returns {string|null} The key for a random background music
 */
export function getRandomBackgroundMusic(type = 'nature') {
  const options = Object.keys(BACKGROUND_AUDIO_MAP).filter(key => 
    type === 'nature' ? ['rain', 'ocean', 'forest'].includes(key) : 
    type === 'ambient' ? key.startsWith('ambient') : true
  );
  
  if (options.length === 0) {
    return 'silence';
  }
  
  return options[Math.floor(Math.random() * options.length)];
}