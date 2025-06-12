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
  API_KEYS: 'apiKeys',
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

export const TTS_VOICES = {
  en: {
    standard: 'en-US-Standard-C',
    wavenet: 'en-US-Wavenet-C',
    neural: 'en-US-Neural2-C',
  },
  ja: {
    standard: 'ja-JP-Standard-A',
    wavenet: 'ja-JP-Wavenet-A',
    neural: 'ja-JP-Neural2-A',
  },
};

export const API_ENDPOINTS = {
  GOOGLE_TTS: process.env.GOOGLE_TTS_ENDPOINT || 'https://texttospeech.googleapis.com/v1',
  FREESOUND: process.env.FREESOUND_API_ENDPOINT || 'https://freesound.org/apiv2',
};

export const ERROR_MESSAGES = {
  AUDIO_PLAYBACK_FAILED: 'error_audio_playback',
  NETWORK_ERROR: 'error_network',
  API_KEY_MISSING: 'API key is missing. Please configure in settings.',
  OFFLINE_MODE: 'Running in offline mode. Some features may be limited.',
};