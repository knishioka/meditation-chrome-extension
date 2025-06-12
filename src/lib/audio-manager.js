import { MESSAGE_TYPES, OFFSCREEN_DOCUMENT_PATH, OFFSCREEN_REASONS, OFFSCREEN_JUSTIFICATION } from '@config/constants';

class AudioManager {
  constructor() {
    this.offscreenCreated = false;
    this.audioState = {
      isPlaying: false,
      currentSession: null,
      volume: {
        voice: 0.8,
        music: 0.3,
      },
    };
  }

  async ensureOffscreenDocument() {
    if (await chrome.offscreen.hasDocument()) {
      return true;
    }

    try {
      await chrome.offscreen.createDocument({
        url: OFFSCREEN_DOCUMENT_PATH,
        reasons: OFFSCREEN_REASONS,
        justification: OFFSCREEN_JUSTIFICATION,
      });
      this.offscreenCreated = true;
      // Wait a bit for the document to be ready
      await new Promise((resolve) => setTimeout(resolve, 100));
      return true;
    } catch (error) {
      console.error('Failed to create offscreen document:', error);
      return false;
    }
  }

  async sendMessage(type, data = {}) {
    await this.ensureOffscreenDocument();
    
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ type, data }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response && response.error) {
          reject(new Error(response.error));
        } else {
          resolve(response);
        }
      });
    });
  }

  async playMeditation(sessionConfig) {
    try {
      this.audioState.currentSession = sessionConfig;
      this.audioState.isPlaying = true;
      
      const response = await this.sendMessage(MESSAGE_TYPES.PLAY_AUDIO, {
        session: sessionConfig,
        volume: this.audioState.volume,
      });
      
      return response;
    } catch (error) {
      this.audioState.isPlaying = false;
      throw error;
    }
  }

  async stopAudio() {
    try {
      const response = await this.sendMessage(MESSAGE_TYPES.STOP_AUDIO);
      this.audioState.isPlaying = false;
      this.audioState.currentSession = null;
      return response;
    } catch (error) {
      console.error('Error stopping audio:', error);
      throw error;
    }
  }

  async pauseAudio() {
    try {
      const response = await this.sendMessage(MESSAGE_TYPES.PAUSE_AUDIO);
      this.audioState.isPlaying = false;
      return response;
    } catch (error) {
      console.error('Error pausing audio:', error);
      throw error;
    }
  }

  async resumeAudio() {
    try {
      const response = await this.sendMessage(MESSAGE_TYPES.RESUME_AUDIO);
      this.audioState.isPlaying = true;
      return response;
    } catch (error) {
      console.error('Error resuming audio:', error);
      throw error;
    }
  }

  async setVolume(volumeType, value) {
    if (volumeType !== 'voice' && volumeType !== 'music') {
      throw new Error('Invalid volume type. Use "voice" or "music".');
    }
    
    const clampedValue = Math.max(0, Math.min(1, value));
    this.audioState.volume[volumeType] = clampedValue;
    
    try {
      return await this.sendMessage(MESSAGE_TYPES.SET_VOLUME, {
        type: volumeType,
        value: clampedValue,
      });
    } catch (error) {
      console.error('Error setting volume:', error);
      throw error;
    }
  }

  async preloadAudio(urls) {
    try {
      return await this.sendMessage(MESSAGE_TYPES.PRELOAD_AUDIO, { urls });
    } catch (error) {
      console.error('Error preloading audio:', error);
      throw error;
    }
  }

  async getAudioStatus() {
    try {
      const response = await this.sendMessage(MESSAGE_TYPES.GET_AUDIO_STATUS);
      return {
        ...this.audioState,
        ...response,
      };
    } catch (error) {
      console.error('Error getting audio status:', error);
      return this.audioState;
    }
  }

  // TTS generation
  async generateTTS(text, language, options = {}) {
    try {
      return await this.sendMessage(MESSAGE_TYPES.TTS_GENERATE, {
        text,
        language,
        options,
      });
    } catch (error) {
      console.error('Error generating TTS:', error);
      throw error;
    }
  }

  // Cleanup
  async cleanup() {
    try {
      await this.stopAudio();
      if (this.offscreenCreated && await chrome.offscreen.hasDocument()) {
        await chrome.offscreen.closeDocument();
        this.offscreenCreated = false;
      }
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Session management helpers
  createSessionConfig(preferences, meditationScript) {
    return {
      id: `session_${Date.now()}`,
      duration: preferences.duration * 60 * 1000, // Convert to milliseconds
      type: preferences.meditationType,
      language: preferences.language,
      backgroundSound: preferences.backgroundSound,
      voiceEnabled: preferences.voiceEnabled,
      script: meditationScript,
      startTime: Date.now(),
    };
  }

  calculateProgress(session) {
    if (!session || !session.startTime || !session.duration) {
      return 0;
    }
    const elapsed = Date.now() - session.startTime;
    return Math.min(100, (elapsed / session.duration) * 100);
  }

  formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}

export default new AudioManager();