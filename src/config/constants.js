export const MEDITATION_TYPES = {
  BREATH_AWARENESS: 'breath_awareness',
  BODY_SCAN: 'body_scan',
  LOVING_KINDNESS: 'loving_kindness',
  MINDFULNESS: 'mindfulness',
};

export const BACKGROUND_SOUNDS = {
  NATURE: 'nature_sounds',
  AMBIENT: 'ambient_music',
  SILENCE: 'silence',
};

export const DURATIONS = [5, 10, 15, 20, 30]; // in minutes

export const LANGUAGES = {
  EN: 'en',
  JA: 'ja',
};

export const STORAGE_KEYS = {
  USER_PREFERENCES: 'userPreferences',
  SESSION_HISTORY: 'sessionHistory',
  CACHED_AUDIO: 'cachedAudio',
};

export const DEFAULT_PREFERENCES = {
  language: LANGUAGES.EN,
  duration: 10,
  meditationType: MEDITATION_TYPES.BREATH_AWARENESS,
  backgroundSound: BACKGROUND_SOUNDS.AMBIENT,
  voiceEnabled: true,
  voiceVolume: 0.8,
  musicVolume: 0.3,
  voiceGender: 'neutral',
};

export const OFFSCREEN_DOCUMENT_PATH = '/offscreen.html';
export const OFFSCREEN_REASONS = ['AUDIO_PLAYBACK'];
export const OFFSCREEN_JUSTIFICATION = 'Playing meditation audio and voice guidance';

export const MESSAGE_TYPES = {
  PLAY_AUDIO: 'PLAY_AUDIO',
  STOP_AUDIO: 'STOP_AUDIO',
  PAUSE_AUDIO: 'PAUSE_AUDIO',
  RESUME_AUDIO: 'RESUME_AUDIO',
  SET_VOLUME: 'SET_VOLUME',
  PRELOAD_AUDIO: 'PRELOAD_AUDIO',
  GET_AUDIO_STATUS: 'GET_AUDIO_STATUS',
  AUDIO_ENDED: 'AUDIO_ENDED',
  AUDIO_ERROR: 'AUDIO_ERROR',
  TTS_GENERATE: 'TTS_GENERATE',
  SESSION_COMPLETE: 'SESSION_COMPLETE',
};

export const AUDIO_FORMATS = {
  MP3: 'audio/mpeg',
  WAV: 'audio/wav',
  OGG: 'audio/ogg',
  WEBM: 'audio/webm',
};

// Local audio paths configuration
export const LOCAL_AUDIO_PATHS = {
  VOICE_BASE: 'audio/voice',
  BACKGROUND_BASE: 'audio/background',
};

// Available background music files
export const BACKGROUND_MUSIC_FILES = {
  NATURE: {
    rain: 'nature/rain-30min.mp3',
    ocean: 'nature/ocean-30min.mp3',
    forest: 'nature/forest-30min.mp3',
  },
  AMBIENT: {
    calm: 'ambient/calm-meditation-30min.mp3',
    peaceful: 'ambient/peaceful-meditation-30min.mp3',
  },
  SILENCE: 'silence-30min.mp3',
};

export const ERROR_MESSAGES = {
  AUDIO_PLAYBACK_FAILED: 'error_audio_playback',
  AUDIO_FILE_NOT_FOUND: 'Audio file not found. Please check your installation.',
  OFFLINE_MODE: 'This extension works completely offline.',
};