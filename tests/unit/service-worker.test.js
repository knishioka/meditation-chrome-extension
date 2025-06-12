import { MESSAGE_TYPES } from '@config/constants';

// Mock the imports
jest.mock('@lib/storage-manager');
jest.mock('@lib/audio-manager');
jest.mock('@lib/meditation-content');

describe('Service Worker', () => {
  let mockStorageManager;
  let mockAudioManager;
  let mockMeditationContent;
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Reset modules and re-import
    jest.resetModules();
    mockStorageManager = require('@lib/storage-manager').default;
    mockAudioManager = require('@lib/audio-manager').default;
    mockMeditationContent = require('@lib/meditation-content').default;
    
    // Setup default mocks
    mockStorageManager.getUserPreferences.mockResolvedValue({
      meditationType: 'breath_awareness',
      language: 'en',
      duration: 10,
      backgroundSound: 'ambient_music',
      voiceEnabled: true,
    });
    
    mockMeditationContent.getScript.mockReturnValue({
      title: 'Test Meditation',
      segments: [{ type: 'intro', text: 'Welcome' }],
    });
    
    mockAudioManager.createSessionConfig.mockReturnValue({
      id: 'test-session-123',
      duration: 600000,
    });
    
    mockAudioManager.playMeditation.mockResolvedValue({ success: true });
    
    mockStorageManager.addSessionToHistory.mockResolvedValue(true);
    mockStorageManager.getSessionHistory.mockResolvedValue([]);
  });

  describe('Message Handling', () => {
    test('should handle PLAY_AUDIO message', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      const message = {
        type: MESSAGE_TYPES.PLAY_AUDIO,
        data: {},
      };
      
      const result = await handleMessage(message);
      
      expect(mockStorageManager.getUserPreferences).toHaveBeenCalled();
      expect(mockMeditationContent.getScript).toHaveBeenCalledWith(
        'breath_awareness',
        'en',
        10
      );
      expect(mockAudioManager.createSessionConfig).toHaveBeenCalled();
      expect(mockAudioManager.playMeditation).toHaveBeenCalled();
      expect(mockStorageManager.addSessionToHistory).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    test('should handle STOP_AUDIO message', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      mockAudioManager.stopAudio.mockResolvedValue({ success: true });
      
      const message = {
        type: MESSAGE_TYPES.STOP_AUDIO,
        data: {},
      };
      
      const result = await handleMessage(message);
      
      expect(mockAudioManager.stopAudio).toHaveBeenCalled();
      expect(result).toEqual({ success: true });
    });

    test('should handle SET_VOLUME message', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      mockAudioManager.setVolume.mockResolvedValue({ success: true });
      
      const message = {
        type: MESSAGE_TYPES.SET_VOLUME,
        data: { type: 'voice', value: 0.5 },
      };
      
      const result = await handleMessage(message);
      
      expect(mockAudioManager.setVolume).toHaveBeenCalledWith('voice', 0.5);
      expect(result).toEqual({ success: true });
    });

    test('should handle SESSION_COMPLETE message', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      mockStorageManager.getSessionHistory.mockResolvedValue([
        { id: 'session-1', completed: false },
      ]);
      mockStorageManager.set.mockResolvedValue(true);
      
      const message = {
        type: MESSAGE_TYPES.SESSION_COMPLETE,
        data: { sessionId: 'session-1' },
      };
      
      const result = await handleMessage(message);
      
      expect(mockStorageManager.getSessionHistory).toHaveBeenCalledWith(1);
      expect(result).toEqual({ success: true });
    });

    test('should handle unknown message type', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      const message = {
        type: 'UNKNOWN_TYPE',
        data: {},
      };
      
      await expect(handleMessage(message)).rejects.toThrow('Unknown message type: UNKNOWN_TYPE');
    });

    test('should handle errors in message processing', async () => {
      const { handleMessage } = require('@/background/service-worker');
      
      mockStorageManager.getUserPreferences.mockRejectedValue(new Error('Storage error'));
      
      const message = {
        type: MESSAGE_TYPES.PLAY_AUDIO,
        data: {},
      };
      
      await expect(handleMessage(message)).rejects.toThrow('Storage error');
    });
  });

  describe('Storage Change Listener', () => {
    test('should update reminders when preferences change', () => {
      const mockSetupDailyReminder = jest.fn();
      
      // Simulate storage change event
      const changes = {
        userPreferences: {
          newValue: {
            remindersEnabled: true,
            reminderTime: '09:00',
          },
        },
      };
      
      // This would be tested with integration tests
      // as we need to test the actual event listener registration
    });
  });

  describe('Context Menu', () => {
    test('should create context menu on install', () => {
      // This would be tested with integration tests
      // as we need to test the actual chrome.runtime.onInstalled listener
    });
  });
});