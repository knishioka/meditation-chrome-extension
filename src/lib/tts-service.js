import { LANGUAGES } from '@config/constants';
import ttsScriptGenerator from '@lib/tts-script-generator';
import storageManager from '@lib/storage-manager';
import { getVoiceAudioPath, parseTextToAudioPaths } from '@lib/audio-mapping';

/**
 * TTS Service (Offline Version)
 * Handles voice playback using pre-recorded local audio files
 * No external API dependencies
 */
class TTSService {
  constructor() {
    this.audioCache = new Map();
  }

  /**
   * Generate speech audio from text segment
   * This now returns a path to a local audio file instead of generating speech
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
    
    // Get local audio file
    try {
      const audioData = await this.getLocalAudio(segment, language);
      
      // Cache the result
      this.audioCache.set(cacheKey, audioData);
      await storageManager.setCachedAudio(cacheKey, audioData);
      
      return audioData;
    } catch (error) {
      console.error('Failed to load local audio:', error);
      
      // Return silence as fallback
      return this.createSilentAudio(segment.pauseAfter || 2000);
    }
  }

  /**
   * Get local audio file based on segment content
   */
  async getLocalAudio(segment, language) {
    let audioPath = null;
    
    // First, try to map the segment text to specific audio files
    if (segment.text) {
      // Parse the text to find matching audio files
      const audioPaths = parseTextToAudioPaths(segment.text, language);
      
      if (audioPaths.length > 0) {
        // For now, use the first matching audio
        // In the future, could concatenate multiple audio files
        audioPath = audioPaths[0];
      }
    }
    
    // If no specific match, use generic audio based on segment type
    if (!audioPath) {
      audioPath = this.getGenericAudioPath(segment, language);
    }
    
    if (!audioPath) {
      // No audio file found, return silence
      return this.createSilentAudio(segment.pauseAfter || 2000);
    }
    
    try {
      const response = await fetch(chrome.runtime.getURL(audioPath));
      if (!response.ok) {
        throw new Error(`Failed to load audio: ${audioPath}`);
      }
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    } catch (error) {
      console.error('Failed to load audio file:', audioPath, error);
      return this.createSilentAudio(segment.pauseAfter || 2000);
    }
  }

  /**
   * Get generic audio path based on segment type
   */
  getGenericAudioPath(segment, language) {
    // Map segment types to generic audio files
    const typeToPhrase = {
      intro: 'welcome',
      instruction: 'breathe_in',
      guidance: 'focus_on_your_breath',
      reminder: 'be_present',
      transition: 'gently',
      outro: 'session_complete'
    };
    
    const phraseKey = typeToPhrase[segment.type];
    if (phraseKey) {
      return getVoiceAudioPath(phraseKey, language);
    }
    
    return null;
  }

  /**
   * Generate cache key for audio
   */
  generateCacheKey(segment, language, options) {
    const key = {
      text: segment.text,
      type: segment.type,
      language
    };
    
    return `tts_${btoa(JSON.stringify(key))}`;
  }

  /**
   * Create silent audio buffer
   */
  createSilentAudio(durationMs) {
    const sampleRate = 24000;
    const numberOfSamples = Math.floor(sampleRate * (durationMs / 1000));
    const buffer = new ArrayBuffer(numberOfSamples * 2); // 16-bit PCM
    
    // Fill with silence (zeros)
    const view = new Int16Array(buffer);
    for (let i = 0; i < view.length; i++) {
      view[i] = 0;
    }
    
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
          duration: segment.pauseAfter
        });
      } catch (error) {
        console.error(`Failed to generate audio for segment:`, segment, error);
        errors.push({ segment, error: error.message });
        
        // Add silent audio as fallback
        audioSegments.push({
          segment,
          audioData: this.createSilentAudio(segment.pauseAfter || 2000),
          duration: segment.pauseAfter,
          isError: true
        });
      }
    }
    
    return {
      audioSegments,
      errors,
      totalDuration: audioSegments.reduce((sum, seg) => sum + (seg.duration || 0), 0)
    };
  }

  /**
   * Pre-load common audio files for better performance
   */
  async preloadCommonPhrases(language) {
    const commonPhrases = [
      'welcome',
      'breathe_in',
      'breathe_out',
      'focus_on_your_breath',
      'relax',
      'session_complete'
    ];
    
    const results = [];
    
    for (const phraseKey of commonPhrases) {
      try {
        const audioPath = getVoiceAudioPath(phraseKey, language);
        if (audioPath) {
          const segment = { 
            type: 'preload', 
            text: phraseKey 
          };
          await this.generateSpeech(segment, language);
          results.push({ phrase: phraseKey, success: true });
        }
      } catch (error) {
        results.push({ phrase: phraseKey, success: false, error: error.message });
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
      memoryCacheKeys: Array.from(this.audioCache.keys())
    };
  }

  /**
   * Check if all required audio files exist
   */
  async validateAudioFiles(language) {
    const requiredPhrases = [
      'welcome',
      'breathe_in',
      'breathe_out',
      'session_complete'
    ];
    
    const missingFiles = [];
    
    for (const phrase of requiredPhrases) {
      const audioPath = getVoiceAudioPath(phrase, language);
      if (audioPath) {
        try {
          const response = await fetch(chrome.runtime.getURL(audioPath));
          if (!response.ok) {
            missingFiles.push(audioPath);
          }
        } catch {
          missingFiles.push(audioPath);
        }
      }
    }
    
    return {
      isValid: missingFiles.length === 0,
      missingFiles
    };
  }
}

export default new TTSService();