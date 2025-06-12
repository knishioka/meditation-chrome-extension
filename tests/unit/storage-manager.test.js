import storageManager from '@lib/storage-manager';
import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '@config/constants';

describe('StorageManager', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    chrome.storage.local.get.mockImplementation((keys, callback) => {
      const result = {};
      if (callback) callback(result);
      return Promise.resolve(result);
    });
    chrome.storage.local.set.mockImplementation((items, callback) => {
      if (callback) callback();
      return Promise.resolve();
    });
  });

  describe('Basic Operations', () => {
    test('should get value from storage', async () => {
      const mockData = { testKey: 'testValue' };
      chrome.storage.local.get.mockImplementation((key) => Promise.resolve(mockData));

      const result = await storageManager.get('testKey');
      expect(result).toBe('testValue');
      expect(chrome.storage.local.get).toHaveBeenCalledWith('testKey');
    });

    test('should set value to storage', async () => {
      const result = await storageManager.set('testKey', 'testValue');
      expect(result).toBe(true);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ testKey: 'testValue' });
    });

    test('should remove value from storage', async () => {
      chrome.storage.local.remove = jest.fn().mockResolvedValue();
      const result = await storageManager.remove('testKey');
      expect(result).toBe(true);
      expect(chrome.storage.local.remove).toHaveBeenCalledWith('testKey');
    });

    test('should clear all storage', async () => {
      chrome.storage.local.clear = jest.fn().mockResolvedValue();
      const result = await storageManager.clear();
      expect(result).toBe(true);
      expect(chrome.storage.local.clear).toHaveBeenCalled();
    });

    test('should handle storage errors gracefully', async () => {
      chrome.storage.local.get.mockRejectedValue(new Error('Storage error'));
      const result = await storageManager.get('testKey');
      expect(result).toBeNull();
    });
  });

  describe('User Preferences', () => {
    test('should get user preferences with defaults', async () => {
      chrome.storage.local.get.mockImplementation(() => Promise.resolve({}));
      const preferences = await storageManager.getUserPreferences();
      expect(preferences).toEqual(DEFAULT_PREFERENCES);
    });

    test('should merge stored preferences with defaults', async () => {
      const storedPrefs = { language: 'ja', duration: 15 };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.USER_PREFERENCES]: storedPrefs })
      );

      const preferences = await storageManager.getUserPreferences();
      expect(preferences).toEqual({
        ...DEFAULT_PREFERENCES,
        ...storedPrefs,
      });
    });

    test('should update specific preference', async () => {
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.USER_PREFERENCES]: DEFAULT_PREFERENCES })
      );

      await storageManager.updatePreference('duration', 20);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.USER_PREFERENCES]: {
          ...DEFAULT_PREFERENCES,
          duration: 20,
        },
      });
    });

    test('should set multiple preferences at once', async () => {
      const newPrefs = { language: 'ja', duration: 15 };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.USER_PREFERENCES]: DEFAULT_PREFERENCES })
      );

      await storageManager.setUserPreferences(newPrefs);
      
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.USER_PREFERENCES]: {
          ...DEFAULT_PREFERENCES,
          ...newPrefs,
        },
      });
    });
  });

  describe('Session History', () => {
    test('should add session to history', async () => {
      const mockHistory = [];
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.SESSION_HISTORY]: mockHistory })
      );

      const session = {
        type: 'breath_awareness',
        duration: 600000,
        completed: true,
      };

      await storageManager.addSessionToHistory(session);

      const setCall = chrome.storage.local.set.mock.calls[0][0];
      const savedHistory = setCall[STORAGE_KEYS.SESSION_HISTORY];
      
      expect(savedHistory).toHaveLength(1);
      expect(savedHistory[0]).toMatchObject(session);
      expect(savedHistory[0]).toHaveProperty('timestamp');
      expect(savedHistory[0]).toHaveProperty('id');
    });

    test('should limit history to 100 sessions', async () => {
      const mockHistory = new Array(100).fill({}).map((_, i) => ({ id: i }));
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.SESSION_HISTORY]: mockHistory })
      );

      await storageManager.addSessionToHistory({ type: 'new_session' });

      const setCall = chrome.storage.local.set.mock.calls[0][0];
      const savedHistory = setCall[STORAGE_KEYS.SESSION_HISTORY];
      
      expect(savedHistory).toHaveLength(100);
      expect(savedHistory[0]).toHaveProperty('type', 'new_session');
    });

    test('should get limited session history', async () => {
      const mockHistory = new Array(20).fill({}).map((_, i) => ({ id: i }));
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.SESSION_HISTORY]: mockHistory })
      );

      const history = await storageManager.getSessionHistory(5);
      expect(history).toHaveLength(5);
    });
  });

  describe('Audio Cache', () => {
    test('should cache audio data', async () => {
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.CACHED_AUDIO]: {} })
      );

      const audioData = { url: 'test.mp3', buffer: 'mock-buffer' };
      await storageManager.setCachedAudio('test-key', audioData);

      const setCall = chrome.storage.local.set.mock.calls[0][0];
      const cache = setCall[STORAGE_KEYS.CACHED_AUDIO];
      
      expect(cache['test-key']).toMatchObject({
        data: audioData,
        timestamp: expect.any(Number),
      });
    });

    test('should retrieve cached audio data', async () => {
      const cachedData = {
        'test-key': {
          data: { url: 'test.mp3' },
          timestamp: Date.now(),
        },
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.CACHED_AUDIO]: cachedData })
      );

      const result = await storageManager.getCachedAudio('test-key');
      expect(result).toEqual(cachedData['test-key']);
    });

    test('should clean old cache entries', async () => {
      const oldTimestamp = Date.now() - 8 * 24 * 60 * 60 * 1000; // 8 days ago
      const recentTimestamp = Date.now() - 1 * 24 * 60 * 60 * 1000; // 1 day ago
      
      const cache = {
        'old-key': { data: {}, timestamp: oldTimestamp },
        'recent-key': { data: {}, timestamp: recentTimestamp },
      };
      
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.CACHED_AUDIO]: cache })
      );

      await storageManager.setCachedAudio('new-key', { url: 'new.mp3' });

      const setCall = chrome.storage.local.set.mock.calls[0][0];
      const updatedCache = setCall[STORAGE_KEYS.CACHED_AUDIO];
      
      expect(updatedCache).toHaveProperty('recent-key');
      expect(updatedCache).toHaveProperty('new-key');
      expect(updatedCache).not.toHaveProperty('old-key');
    });
  });

  describe('API Keys', () => {
    test('should store API key', async () => {
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.API_KEYS]: {} })
      );

      await storageManager.setApiKey('google_tts', 'test-api-key');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.API_KEYS]: { google_tts: 'test-api-key' },
      });
    });

    test('should retrieve API keys', async () => {
      const apiKeys = {
        google_tts: 'test-key-1',
        freesound: 'test-key-2',
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.API_KEYS]: apiKeys })
      );

      const result = await storageManager.getApiKeys();
      expect(result).toEqual(apiKeys);
    });

    test('should remove API key', async () => {
      const apiKeys = {
        google_tts: 'test-key-1',
        freesound: 'test-key-2',
      };
      chrome.storage.local.get.mockImplementation(() => 
        Promise.resolve({ [STORAGE_KEYS.API_KEYS]: apiKeys })
      );

      await storageManager.removeApiKey('google_tts');

      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.API_KEYS]: { freesound: 'test-key-2' },
      });
    });
  });

  describe('Storage Usage', () => {
    test('should get storage usage information', async () => {
      chrome.storage.local.getBytesInUse = jest.fn((keys, callback) => {
        callback(5242880); // 5MB
      });
      chrome.storage.local.QUOTA_BYTES = 10485760; // 10MB

      const usage = await storageManager.getStorageUsage();
      
      expect(usage).toEqual({
        used: 5242880,
        total: 10485760,
        percentage: 50,
      });
    });
  });

  describe('Export/Import', () => {
    test('should export all data', async () => {
      const mockData = {
        [STORAGE_KEYS.USER_PREFERENCES]: { language: 'ja' },
        [STORAGE_KEYS.SESSION_HISTORY]: [{ id: 1 }],
        [STORAGE_KEYS.CACHED_AUDIO]: {},
        [STORAGE_KEYS.API_KEYS]: { test: 'key' },
      };

      chrome.storage.local.get.mockImplementation((key) => {
        return Promise.resolve({ [key]: mockData[key] });
      });

      const exportedData = await storageManager.exportData();
      
      expect(exportedData).toEqual(mockData);
    });

    test('should import data', async () => {
      const importData = {
        [STORAGE_KEYS.USER_PREFERENCES]: { language: 'en' },
        [STORAGE_KEYS.SESSION_HISTORY]: [{ id: 2 }],
      };

      await storageManager.importData(importData);

      expect(chrome.storage.local.set).toHaveBeenCalledTimes(Object.keys(importData).length);
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.USER_PREFERENCES]: { language: 'en' },
      });
      expect(chrome.storage.local.set).toHaveBeenCalledWith({
        [STORAGE_KEYS.SESSION_HISTORY]: [{ id: 2 }],
      });
    });
  });
});