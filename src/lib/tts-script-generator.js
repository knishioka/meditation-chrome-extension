import { LANGUAGES } from '@config/constants';

/**
 * TTS Script Generator
 * Converts meditation scripts into SSML (Speech Synthesis Markup Language) format
 * with proper pauses, breathing cues, and prosody for meditation guidance
 */
class TTSScriptGenerator {
  constructor() {
    // Pause durations for different meditation contexts
    this.pauseDurations = {
      microPause: 500,      // 0.5s - between phrases
      shortPause: 1000,     // 1s - after short instructions
      normalPause: 2000,    // 2s - standard pause
      longPause: 3000,      // 3s - after important instructions
      breathPause: 4000,    // 4s - for breathing exercises
      extendedPause: 5000,  // 5s - for deep reflection
      silencePeriod: 10000, // 10s - silent meditation periods
    };

    // Speaking rates for different content types
    this.speakingRates = {
      verySlowRate: '0.7',  // For important instructions
      slowRate: '0.8',      // Default meditation pace
      normalRate: '0.9',    // For transitions
      gentleRate: '0.85',   // For most content
    };

    // Pitch settings
    this.pitchSettings = {
      low: '-2st',          // Calming, grounding
      normal: '0st',        // Default
      slightlyLow: '-1st',  // Soothing
    };

    // Volume settings
    this.volumeSettings = {
      soft: '-2dB',         // Gentle guidance
      normal: '0dB',        // Default
      whisper: '-6dB',      // Very soft passages
    };
  }

  /**
   * Generate SSML markup for a meditation segment
   */
  generateSegmentSSML(segment, language) {
    const { type, text, pauseAfter = 2000 } = segment;
    
    if (type === 'silence' || !text) {
      return this.createSilencePause(pauseAfter);
    }

    // Build SSML based on segment type
    let ssml = '<speak>';
    
    // Add language tag
    ssml += `<lang xml:lang="${this.getLanguageCode(language)}">`;
    
    // Apply prosody based on segment type
    const prosody = this.getProsodyForSegmentType(type);
    ssml += `<prosody rate="${prosody.rate}" pitch="${prosody.pitch}" volume="${prosody.volume}">`;
    
    // Process the text with appropriate pauses
    ssml += this.processTextWithPauses(text, type, language);
    
    ssml += '</prosody>';
    ssml += '</lang>';
    
    // Add pause after the segment
    ssml += this.createPause(pauseAfter);
    
    ssml += '</speak>';
    
    return ssml;
  }

  /**
   * Process text and insert appropriate pauses
   */
  processTextWithPauses(text, segmentType, language) {
    // Split text into sentences
    const sentences = this.splitIntoSentences(text, language);
    let processedText = '';
    
    sentences.forEach((sentence, index) => {
      // Add the sentence
      processedText += this.processSentence(sentence, segmentType, language);
      
      // Add pause between sentences
      if (index < sentences.length - 1) {
        const pauseDuration = this.getPauseBetweenSentences(segmentType);
        processedText += this.createPause(pauseDuration);
      }
    });
    
    return processedText;
  }

  /**
   * Process individual sentence with breathing cues and emphasis
   */
  processSentence(sentence, segmentType, language) {
    let processed = sentence;
    
    // Handle breathing instructions
    if (this.isBreathingInstruction(sentence, language)) {
      processed = this.processBreathingInstruction(sentence, language);
    }
    
    // Add emphasis to key words
    processed = this.addEmphasisToKeyWords(processed, language);
    
    // Handle ellipsis (breathing indicators)
    processed = this.processEllipsis(processed);
    
    return processed;
  }

  /**
   * Check if sentence contains breathing instructions
   */
  isBreathingInstruction(sentence, language) {
    const breathingKeywords = {
      en: ['breath', 'inhale', 'exhale', 'breathe', 'breathing'],
      ja: ['呼吸', '吸って', '吐いて', '息', 'いき'],
    };
    
    const keywords = breathingKeywords[language] || breathingKeywords.en;
    const lowerSentence = sentence.toLowerCase();
    
    return keywords.some(keyword => lowerSentence.includes(keyword.toLowerCase()));
  }

  /**
   * Process breathing instructions with appropriate timing
   */
  processBreathingInstruction(sentence, language) {
    let processed = sentence;
    
    // Replace common breathing patterns with SSML
    const breathingPatterns = this.getBreathingPatterns(language);
    
    breathingPatterns.forEach(pattern => {
      processed = processed.replace(pattern.regex, pattern.replacement);
    });
    
    return processed;
  }

  /**
   * Get breathing patterns for each language
   */
  getBreathingPatterns(language) {
    if (language === LANGUAGES.JA) {
      return [
        {
          regex: /深く息を吸って/g,
          replacement: '<prosody rate="0.7">深く</prosody>' + this.createPause(500) + 
                      '<prosody rate="0.6">息を吸って</prosody>' + this.createPause(3000),
        },
        {
          regex: /ゆっくりと吐き出します/g,
          replacement: '<prosody rate="0.6">ゆっくりと</prosody>' + this.createPause(500) + 
                      '<prosody rate="0.5">吐き出します</prosody>' + this.createPause(4000),
        },
        {
          regex: /息を吸って\.{3}/g,
          replacement: '息を吸って' + this.createPause(3000),
        },
        {
          regex: /息を吐いて\.{3}/g,
          replacement: '息を吐いて' + this.createPause(4000),
        },
      ];
    }
    
    // English patterns
    return [
      {
        regex: /take a deep breath in/gi,
        replacement: '<prosody rate="0.7">take a deep</prosody>' + this.createPause(500) + 
                    '<prosody rate="0.6">breath in</prosody>' + this.createPause(3000),
      },
      {
        regex: /slowly release/gi,
        replacement: '<prosody rate="0.6">slowly</prosody>' + this.createPause(500) + 
                    '<prosody rate="0.5">release</prosody>' + this.createPause(4000),
      },
      {
        regex: /breathe in\.{3}/gi,
        replacement: 'breathe in' + this.createPause(3000),
      },
      {
        regex: /breathe out\.{3}/gi,
        replacement: 'breathe out' + this.createPause(4000),
      },
      {
        regex: /inhale\.{3}/gi,
        replacement: 'inhale' + this.createPause(3000),
      },
      {
        regex: /exhale\.{3}/gi,
        replacement: 'exhale' + this.createPause(4000),
      },
    ];
  }

  /**
   * Add emphasis to important meditation words
   */
  addEmphasisToKeyWords(text, language) {
    const emphasisWords = {
      en: {
        'present moment': '<emphasis level="moderate">present moment</emphasis>',
        'here and now': '<emphasis level="moderate">here and now</emphasis>',
        'let go': '<emphasis level="moderate">let go</emphasis>',
        'release': '<emphasis level="moderate">release</emphasis>',
        'relax': '<emphasis level="strong">relax</emphasis>',
        'peace': '<emphasis level="moderate">peace</emphasis>',
        'calm': '<emphasis level="moderate">calm</emphasis>',
      },
      ja: {
        '今ここ': '<emphasis level="moderate">今ここ</emphasis>',
        '解放': '<emphasis level="moderate">解放</emphasis>',
        'リラックス': '<emphasis level="strong">リラックス</emphasis>',
        '平和': '<emphasis level="moderate">平和</emphasis>',
        '静か': '<emphasis level="moderate">静か</emphasis>',
        'ゆっくり': '<emphasis level="moderate">ゆっくり</emphasis>',
      },
    };
    
    const words = emphasisWords[language] || emphasisWords.en;
    let processed = text;
    
    Object.entries(words).forEach(([word, replacement]) => {
      const regex = new RegExp(word, 'gi');
      processed = processed.replace(regex, replacement);
    });
    
    return processed;
  }

  /**
   * Process ellipsis into proper pauses
   */
  processEllipsis(text) {
    // Replace ellipsis with appropriate pauses
    return text
      .replace(/\.{3,}/g, this.createPause(2000))  // Multiple dots become 2s pause
      .replace(/…/g, this.createPause(2000));       // Ellipsis character
  }

  /**
   * Get prosody settings for different segment types
   */
  getProsodyForSegmentType(type) {
    const prosodyMap = {
      intro: {
        rate: this.speakingRates.slowRate,
        pitch: this.pitchSettings.normal,
        volume: this.volumeSettings.normal,
      },
      instruction: {
        rate: this.speakingRates.verySlowRate,
        pitch: this.pitchSettings.slightlyLow,
        volume: this.volumeSettings.normal,
      },
      guidance: {
        rate: this.speakingRates.gentleRate,
        pitch: this.pitchSettings.slightlyLow,
        volume: this.volumeSettings.soft,
      },
      reminder: {
        rate: this.speakingRates.normalRate,
        pitch: this.pitchSettings.normal,
        volume: this.volumeSettings.soft,
      },
      outro: {
        rate: this.speakingRates.slowRate,
        pitch: this.pitchSettings.normal,
        volume: this.volumeSettings.normal,
      },
    };
    
    return prosodyMap[type] || prosodyMap.guidance;
  }

  /**
   * Get pause duration between sentences based on segment type
   */
  getPauseBetweenSentences(segmentType) {
    const pauseMap = {
      intro: this.pauseDurations.normalPause,
      instruction: this.pauseDurations.longPause,
      guidance: this.pauseDurations.normalPause,
      reminder: this.pauseDurations.shortPause,
      outro: this.pauseDurations.normalPause,
    };
    
    return pauseMap[segmentType] || this.pauseDurations.normalPause;
  }

  /**
   * Split text into sentences based on language
   */
  splitIntoSentences(text, language) {
    if (language === LANGUAGES.JA) {
      // Japanese sentence splitting
      return text.split(/(?<=[。！？])\s*/);
    }
    
    // English sentence splitting
    return text.split(/(?<=[.!?])\s+/);
  }

  /**
   * Create SSML pause element
   */
  createPause(milliseconds) {
    return `<break time="${milliseconds}ms"/>`;
  }

  /**
   * Create SSML for silence period
   */
  createSilencePause(milliseconds) {
    return `<speak><break time="${milliseconds}ms"/></speak>`;
  }

  /**
   * Get proper language code for SSML
   */
  getLanguageCode(language) {
    const languageCodes = {
      en: 'en-US',
      ja: 'ja-JP',
    };
    
    return languageCodes[language] || 'en-US';
  }

  /**
   * Generate complete SSML script for a meditation session
   */
  generateFullSessionSSML(script, language) {
    const ssmlSegments = script.segments.map(segment => 
      this.generateSegmentSSML(segment, language)
    );
    
    return ssmlSegments;
  }

  /**
   * Generate test SSML for validation
   */
  generateTestSSML(language) {
    const testScripts = {
      en: {
        segments: [
          {
            type: 'intro',
            text: 'Welcome to your meditation session. Take a deep breath in... and slowly release.',
            pauseAfter: 3000,
          },
          {
            type: 'instruction',
            text: 'Breathe in... breathe out... Let your body relax.',
            pauseAfter: 5000,
          },
        ],
      },
      ja: {
        segments: [
          {
            type: 'intro',
            text: '瞑想セッションへようこそ。深く息を吸って... ゆっくりと吐き出します。',
            pauseAfter: 3000,
          },
          {
            type: 'instruction',
            text: '息を吸って... 息を吐いて... 体をリラックスさせてください。',
            pauseAfter: 5000,
          },
        ],
      },
    };
    
    const script = testScripts[language] || testScripts.en;
    return this.generateFullSessionSSML(script, language);
  }
}

export default new TTSScriptGenerator();