import { MESSAGE_TYPES, AUDIO_FORMATS, BACKGROUND_MUSIC_FILES } from '@config/constants';
import ttsService from '@lib/tts-service';

class OffscreenAudioPlayer {
  constructor() {
    this.audioContext = null;
    this.musicSource = null;
    this.voiceSource = null;
    this.musicGainNode = null;
    this.voiceGainNode = null;
    this.masterGainNode = null;
    this.currentSession = null;
    this.isPlaying = false;
    this.isPaused = false;
    this.audioCache = new Map();
    this.voiceQueue = [];
    this.currentVoiceIndex = 0;
    this.sessionTimer = null;
  }

  async initialize() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Create gain nodes for volume control
      this.musicGainNode = this.audioContext.createGain();
      this.voiceGainNode = this.audioContext.createGain();
      this.masterGainNode = this.audioContext.createGain();
      
      // Connect nodes
      this.musicGainNode.connect(this.masterGainNode);
      this.voiceGainNode.connect(this.masterGainNode);
      this.masterGainNode.connect(this.audioContext.destination);
      
      // Set default volumes
      this.musicGainNode.gain.value = 0.3;
      this.voiceGainNode.gain.value = 0.8;
      this.masterGainNode.gain.value = 1.0;
    }
  }

  async handleMessage(message) {
    const { type, data } = message;
    
    try {
      switch (type) {
        case MESSAGE_TYPES.PLAY_AUDIO:
          return await this.startSession(data);
        
        case MESSAGE_TYPES.STOP_AUDIO:
          return await this.stopSession();
        
        case MESSAGE_TYPES.PAUSE_AUDIO:
          return await this.pauseSession();
        
        case MESSAGE_TYPES.RESUME_AUDIO:
          return await this.resumeSession();
        
        case MESSAGE_TYPES.SET_VOLUME:
          return this.setVolume(data.type, data.value);
        
        case MESSAGE_TYPES.GET_AUDIO_STATUS:
          return this.getStatus();
        
        case MESSAGE_TYPES.PRELOAD_AUDIO:
          return await this.preloadAudio(data.urls);
        
        case MESSAGE_TYPES.TTS_GENERATE:
          return await this.generateTTS(data.text, data.language, data.options);
        
        default:
          throw new Error(`Unknown message type: ${type}`);
      }
    } catch (error) {
      console.error('Error handling message:', error);
      throw error;
    }
  }

  async startSession(data) {
    await this.initialize();
    
    this.currentSession = data.session;
    this.isPlaying = true;
    this.isPaused = false;
    this.currentVoiceIndex = 0;
    
    // Set volumes
    if (data.volume) {
      this.musicGainNode.gain.value = data.volume.music || 0.3;
      this.voiceGainNode.gain.value = data.volume.voice || 0.8;
    }
    
    // Start background music
    if (this.currentSession.backgroundSound !== 'silence') {
      await this.startBackgroundMusic();
    }
    
    // Process voice guidance script
    if (this.currentSession.voiceEnabled && this.currentSession.script) {
      await this.processVoiceScript();
    }
    
    // Set session timer
    this.sessionTimer = setTimeout(() => {
      this.onSessionComplete();
    }, this.currentSession.duration);
    
    return { success: true, sessionId: this.currentSession.id };
  }

  async stopSession() {
    this.isPlaying = false;
    this.isPaused = false;
    
    // Stop all audio
    if (this.musicSource) {
      this.musicSource.stop();
      this.musicSource = null;
    }
    
    if (this.voiceSource) {
      this.voiceSource.stop();
      this.voiceSource = null;
    }
    
    // Clear timers
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      this.sessionTimer = null;
    }
    
    // Clear voice queue
    this.voiceQueue.forEach(item => {
      if (item.timer) {
        clearTimeout(item.timer);
      }
    });
    this.voiceQueue = [];
    
    this.currentSession = null;
    
    return { success: true };
  }

  async pauseSession() {
    if (!this.isPlaying || this.isPaused) {
      return { success: false, error: 'Session not playing' };
    }
    
    this.isPaused = true;
    
    // Pause audio context
    if (this.audioContext.state === 'running') {
      await this.audioContext.suspend();
    }
    
    // Pause timers
    if (this.sessionTimer) {
      clearTimeout(this.sessionTimer);
      // Calculate remaining time
      const elapsed = Date.now() - this.currentSession.startTime;
      this.currentSession.remainingTime = this.currentSession.duration - elapsed;
    }
    
    return { success: true };
  }

  async resumeSession() {
    if (!this.isPaused) {
      return { success: false, error: 'Session not paused' };
    }
    
    this.isPaused = false;
    
    // Resume audio context
    if (this.audioContext.state === 'suspended') {
      await this.audioContext.resume();
    }
    
    // Resume session timer
    if (this.currentSession.remainingTime) {
      this.currentSession.startTime = Date.now();
      this.sessionTimer = setTimeout(() => {
        this.onSessionComplete();
      }, this.currentSession.remainingTime);
    }
    
    return { success: true };
  }

  setVolume(type, value) {
    const clampedValue = Math.max(0, Math.min(1, value));
    
    if (type === 'voice' && this.voiceGainNode) {
      this.voiceGainNode.gain.value = clampedValue;
    } else if (type === 'music' && this.musicGainNode) {
      this.musicGainNode.gain.value = clampedValue;
    } else if (type === 'master' && this.masterGainNode) {
      this.masterGainNode.gain.value = clampedValue;
    }
    
    return { success: true, type, value: clampedValue };
  }

  getStatus() {
    return {
      isPlaying: this.isPlaying,
      isPaused: this.isPaused,
      currentSession: this.currentSession,
      volumes: {
        voice: this.voiceGainNode?.gain.value || 0.8,
        music: this.musicGainNode?.gain.value || 0.3,
        master: this.masterGainNode?.gain.value || 1.0,
      },
    };
  }

  async startBackgroundMusic() {
    try {
      // For now, use a placeholder URL - in production, this would fetch from API
      const audioUrl = this.getBackgroundMusicUrl();
      const audioBuffer = await this.loadAudio(audioUrl);
      
      this.musicSource = this.audioContext.createBufferSource();
      this.musicSource.buffer = audioBuffer;
      this.musicSource.loop = true;
      this.musicSource.connect(this.musicGainNode);
      this.musicSource.start(0);
    } catch (error) {
      console.error('Error starting background music:', error);
      // Continue without background music
    }
  }

  async processVoiceScript() {
    const { segments } = this.currentSession.script;
    let delay = 0;
    
    for (const segment of segments) {
      if (segment.type === 'silence') {
        delay += segment.pauseAfter;
        continue;
      }
      
      const voiceItem = {
        text: segment.text,
        delay,
        segment,
      };
      
      this.voiceQueue.push(voiceItem);
      delay += segment.duration || segment.pauseAfter;
    }
    
    // Start playing voice segments
    this.playNextVoiceSegment();
  }

  async playNextVoiceSegment() {
    if (!this.isPlaying || this.currentVoiceIndex >= this.voiceQueue.length) {
      return;
    }
    
    const voiceItem = this.voiceQueue[this.currentVoiceIndex];
    
    voiceItem.timer = setTimeout(async () => {
      if (!this.isPlaying) return;
      
      try {
        // Generate TTS audio with segment information
        const audioData = await this.generateTTS(
          voiceItem.text,
          this.currentSession.language,
          { 
            segmentType: voiceItem.segment.type,
            pauseAfter: voiceItem.segment.pauseAfter,
            speakingRate: 0.85,
          }
        );
        
        // Play the audio
        await this.playVoiceAudio(audioData);
        
        // Move to next segment
        this.currentVoiceIndex++;
        this.playNextVoiceSegment();
      } catch (error) {
        console.error('Error playing voice segment:', error);
        // Continue to next segment
        this.currentVoiceIndex++;
        this.playNextVoiceSegment();
      }
    }, voiceItem.delay);
  }

  async playVoiceAudio(audioData) {
    const audioBuffer = await this.audioContext.decodeAudioData(audioData);
    
    if (this.voiceSource) {
      this.voiceSource.stop();
    }
    
    this.voiceSource = this.audioContext.createBufferSource();
    this.voiceSource.buffer = audioBuffer;
    this.voiceSource.connect(this.voiceGainNode);
    this.voiceSource.start(0);
  }

  async loadAudio(url) {
    // Check cache first
    if (this.audioCache.has(url)) {
      return this.audioCache.get(url);
    }
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch audio: ${response.statusText}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Cache the decoded audio
      this.audioCache.set(url, audioBuffer);
      
      return audioBuffer;
    } catch (error) {
      console.error('Error loading audio:', error);
      throw error;
    }
  }

  async preloadAudio(urls) {
    const results = await Promise.allSettled(
      urls.map(url => this.loadAudio(url))
    );
    
    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;
    
    return { success: true, loaded: successful, failed };
  }

  async generateTTS(text, language, options = {}) {
    // If no text, return silence
    if (!text) {
      return this.createSilentAudio(1000); // 1 second of silence
    }
    
    try {
      // Create a segment object for the TTS service
      const segment = {
        type: options.segmentType || 'guidance',
        text: text,
        pauseAfter: options.pauseAfter || 2000,
      };
      
      // Generate audio using TTS service
      const audioData = await ttsService.generateSpeech(segment, language, options);
      return audioData;
    } catch (error) {
      console.error('Error generating TTS:', error);
      
      // Fallback to test tone in development
      if (process.env.NODE_ENV === 'development') {
        return this.createTestTone(2000);
      }
      
      throw error;
    }
  }

  createSilentAudio(durationMs) {
    const sampleRate = this.audioContext.sampleRate;
    const numberOfSamples = Math.floor(sampleRate * (durationMs / 1000));
    const arrayBuffer = new ArrayBuffer(numberOfSamples * 2); // 16-bit audio
    return arrayBuffer;
  }

  createTestTone(durationMs) {
    const sampleRate = this.audioContext.sampleRate;
    const numberOfSamples = Math.floor(sampleRate * (durationMs / 1000));
    const arrayBuffer = new ArrayBuffer(numberOfSamples * 4); // 32-bit float
    const float32Array = new Float32Array(arrayBuffer);
    
    // Generate a simple sine wave
    const frequency = 440; // A4 note
    for (let i = 0; i < numberOfSamples; i++) {
      float32Array[i] = Math.sin(2 * Math.PI * frequency * i / sampleRate) * 0.1;
    }
    
    return arrayBuffer;
  }

  getBackgroundMusicUrl() {
    // Get the appropriate background music file
    const baseUrl = chrome.runtime.getURL('audio/background/');
    
    switch (this.currentSession.backgroundSound) {
      case 'nature_sounds': {
        // Pick a random nature sound
        const natureSounds = Object.values(BACKGROUND_MUSIC_FILES.NATURE);
        const randomIndex = Math.floor(Math.random() * natureSounds.length);
        return `${baseUrl}${natureSounds[randomIndex]}`;
      }
      case 'ambient_music': {
        // Pick a random ambient music
        const ambientMusic = Object.values(BACKGROUND_MUSIC_FILES.AMBIENT);
        const randomIndex = Math.floor(Math.random() * ambientMusic.length);
        return `${baseUrl}${ambientMusic[randomIndex]}`;
      }
      case 'silence':
      default:
        return `${baseUrl}${BACKGROUND_MUSIC_FILES.SILENCE}`;
    }
  }

  onSessionComplete() {
    // Send message to service worker
    chrome.runtime.sendMessage({
      type: MESSAGE_TYPES.SESSION_COMPLETE,
      data: {
        sessionId: this.currentSession.id,
        completedAt: Date.now(),
      },
    });
    
    // Stop the session
    this.stopSession();
  }
}

// Initialize the audio player
const audioPlayer = new OffscreenAudioPlayer();

// Listen for messages from the service worker
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  audioPlayer.handleMessage(message)
    .then(sendResponse)
    .catch((error) => {
      sendResponse({ error: error.message });
    });
  return true; // Keep message channel open for async response
});

// Log that offscreen document is ready
console.log('Offscreen audio player initialized');