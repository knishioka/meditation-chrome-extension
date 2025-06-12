import { TTS_VOICES, API_ENDPOINTS, LANGUAGES } from '@config/constants';
import ttsScriptGenerator from '@lib/tts-script-generator';
import storageManager from '@lib/storage-manager';

/**
 * TTS Service
 * Handles Text-to-Speech generation using Google Cloud TTS API
 * with proper SSML formatting for meditation content
 */
class TTSService {
  constructor() {
    this.apiEndpoint = API_ENDPOINTS.GOOGLE_TTS;
    this.audioCache = new Map();
    this.offlineMode = process.env.OFFLINE_MODE === 'true';
  }

  /**
   * Generate speech audio from text segment
   */
  async generateSpeech(segment, language, options = {}) {
    // Generate cache key
    const cacheKey = this.generateCacheKey(segment, language, options);
    
    // Check memory cache first
    if (this.audioCache.has(cacheKey)) {
      return this.audioCache.get(cacheKey);
    }
    
    // Check storage cache
    const cachedAudio = await storageManager.getCachedAudio(cacheKey);
    if (cachedAudio && cachedAudio.data) {
      // Verify cache is not expired (7 days)
      const isExpired = Date.now() - cachedAudio.timestamp > 7 * 24 * 60 * 60 * 1000;
      if (!isExpired) {
        this.audioCache.set(cacheKey, cachedAudio.data);
        return cachedAudio.data;
      }
    }
    
    // Generate new audio
    try {
      const audioData = await this.callTTSAPI(segment, language, options);
      
      // Cache the result
      this.audioCache.set(cacheKey, audioData);
      await storageManager.setCachedAudio(cacheKey, audioData);
      
      return audioData;
    } catch (error) {
      console.error('TTS generation failed:', error);
      
      // Fall back to offline audio if available
      return this.getOfflineAudio(segment, language);
    }
  }

  /**
   * Call Google Cloud TTS API
   */
  async callTTSAPI(segment, language, options) {
    // Check if we're in offline mode
    if (this.offlineMode) {
      return this.getOfflineAudio(segment, language);
    }
    
    // Get API key
    const apiKeys = await storageManager.getApiKeys();
    const apiKey = apiKeys.google_tts || process.env.GOOGLE_TTS_API_KEY;
    
    if (!apiKey) {
      throw new Error('Google TTS API key not configured');
    }
    
    // Generate SSML
    const ssml = ttsScriptGenerator.generateSegmentSSML(segment, language);
    
    // Prepare request body
    const requestBody = {
      input: {
        ssml: ssml,
      },
      voice: this.getVoiceConfig(language, options),
      audioConfig: this.getAudioConfig(options),
    };
    
    // Make API request
    const response = await fetch(`${this.apiEndpoint}/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(`TTS API error: ${error.error?.message || response.statusText}`);
    }
    
    const data = await response.json();
    
    // Convert base64 audio to ArrayBuffer
    const audioData = this.base64ToArrayBuffer(data.audioContent);
    
    return audioData;
  }

  /**
   * Get voice configuration for language
   */
  getVoiceConfig(language, options = {}) {
    const voiceType = options.voiceType || 'wavenet';
    const gender = options.gender || 'NEUTRAL';
    
    // Use predefined voices or custom selection
    let voiceName;
    if (options.voiceName) {
      voiceName = options.voiceName;
    } else {
      const voices = TTS_VOICES[language] || TTS_VOICES.en;
      voiceName = voices[voiceType] || voices.wavenet;
    }
    
    return {
      languageCode: this.getLanguageCode(language),
      name: voiceName,
      ssmlGender: gender,
    };
  }

  /**
   * Get audio configuration
   */
  getAudioConfig(options = {}) {
    return {
      audioEncoding: options.encoding || 'MP3',
      speakingRate: options.speakingRate || 0.85, // Slightly slower for meditation
      pitch: options.pitch || -1.0, // Slightly lower for calming effect
      volumeGainDb: options.volumeGain || 0.0,
      sampleRateHertz: options.sampleRate || 24000,
      effectsProfileId: ['headphone-class-device'], // Optimize for headphones
    };
  }

  /**
   * Get language code for API
   */
  getLanguageCode(language) {
    const codes = {
      en: 'en-US',
      ja: 'ja-JP',
    };
    
    return codes[language] || 'en-US';
  }

  /**
   * Generate cache key for audio
   */
  generateCacheKey(segment, language, options) {
    const key = {
      text: segment.text,
      type: segment.type,
      language,
      voiceType: options.voiceType || 'wavenet',
      speakingRate: options.speakingRate || 0.85,
    };
    
    return `tts_${btoa(JSON.stringify(key))}`;
  }

  /**
   * Convert base64 to ArrayBuffer
   */
  base64ToArrayBuffer(base64) {
    const binaryString = atob(base64);
    const bytes = new Uint8Array(binaryString.length);
    
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    return bytes.buffer;
  }

  /**
   * Get offline audio fallback
   */
  async getOfflineAudio(segment, language) {
    // Map segment types to offline audio files
    const offlineMap = {
      intro: {
        en: 'audio/voice/en/welcome.mp3',
        ja: 'audio/voice/ja/welcome.mp3',
      },
      instruction: {
        en: 'audio/voice/en/breath-in.mp3',
        ja: 'audio/voice/ja/breath-in.mp3',
      },
      outro: {
        en: 'audio/voice/en/session-complete.mp3',
        ja: 'audio/voice/ja/session-complete.mp3',
      },
    };
    
    const audioPath = offlineMap[segment.type]?.[language];
    
    if (!audioPath) {
      // Return silence for unsupported segments in offline mode
      return this.createSilentAudio(segment.pauseAfter || 2000);
    }
    
    try {
      const response = await fetch(chrome.runtime.getURL(audioPath));
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Failed to load offline audio:', error);
      return this.createSilentAudio(segment.pauseAfter || 2000);
    }
  }

  /**
   * Create silent audio buffer
   */
  createSilentAudio(durationMs) {
    const sampleRate = 24000;
    const numberOfSamples = Math.floor(sampleRate * (durationMs / 1000));
    const buffer = new ArrayBuffer(numberOfSamples * 2); // 16-bit PCM
    return buffer;
  }

  /**
   * Batch generate audio for entire meditation session
   */
  async generateSessionAudio(script, language, options = {}) {
    const audioSegments = [];
    const errors = [];
    
    // Process each segment
    for (const segment of script.segments) {
      try {
        const audioData = await this.generateSpeech(segment, language, options);
        audioSegments.push({
          segment,
          audioData,
          duration: segment.pauseAfter,
        });
      } catch (error) {
        console.error(`Failed to generate audio for segment:`, segment, error);
        errors.push({ segment, error: error.message });
        
        // Add silent audio as fallback
        audioSegments.push({
          segment,
          audioData: this.createSilentAudio(segment.pauseAfter || 2000),
          duration: segment.pauseAfter,
          isError: true,
        });
      }
    }
    
    return {
      audioSegments,
      errors,
      totalDuration: audioSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0),
    };
  }

  /**
   * Pre-generate and cache common meditation phrases
   */
  async preloadCommonPhrases(language) {
    const commonPhrases = {
      en: [
        { type: 'instruction', text: 'Take a deep breath in... and slowly release.' },
        { type: 'guidance', text: 'Notice your breath.' },
        { type: 'reminder', text: 'Gently bring your attention back.' },
      ],
      ja: [
        { type: 'instruction', text: '深く息を吸って... ゆっくりと吐き出します。' },
        { type: 'guidance', text: '呼吸に気づいてください。' },
        { type: 'reminder', text: '優しく注意を戻してください。' },
      ],
    };
    
    const phrases = commonPhrases[language] || commonPhrases.en;
    const results = [];
    
    for (const phrase of phrases) {
      try {
        await this.generateSpeech(phrase, language);
        results.push({ phrase, success: true });
      } catch (error) {
        results.push({ phrase, success: false, error: error.message });
      }
    }
    
    return results;
  }

  /**
   * Clear audio cache
   */
  clearCache() {
    this.audioCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      memoryCacheSize: this.audioCache.size,
      memoryCacheKeys: Array.from(this.audioCache.keys()),
    };
  }
}

export default new TTSService();