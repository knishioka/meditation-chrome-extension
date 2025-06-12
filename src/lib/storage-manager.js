import { STORAGE_KEYS, DEFAULT_PREFERENCES } from '@config/constants';

class StorageManager {
  constructor() {
    this.storage = chrome.storage.local;
  }

  async get(key) {
    try {
      const result = await this.storage.get(key);
      return result[key];
    } catch (error) {
      console.error(`Error getting storage key ${key}:`, error);
      return null;
    }
  }

  async set(key, value) {
    try {
      await this.storage.set({ [key]: value });
      return true;
    } catch (error) {
      console.error(`Error setting storage key ${key}:`, error);
      return false;
    }
  }

  async remove(key) {
    try {
      await this.storage.remove(key);
      return true;
    } catch (error) {
      console.error(`Error removing storage key ${key}:`, error);
      return false;
    }
  }

  async clear() {
    try {
      await this.storage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing storage:', error);
      return false;
    }
  }

  async getUserPreferences() {
    const preferences = await this.get(STORAGE_KEYS.USER_PREFERENCES);
    return { ...DEFAULT_PREFERENCES, ...preferences };
  }

  async setUserPreferences(preferences) {
    const current = await this.getUserPreferences();
    const updated = { ...current, ...preferences };
    return this.set(STORAGE_KEYS.USER_PREFERENCES, updated);
  }

  async updatePreference(key, value) {
    const preferences = await this.getUserPreferences();
    preferences[key] = value;
    return this.set(STORAGE_KEYS.USER_PREFERENCES, preferences);
  }

  async addSessionToHistory(session) {
    const history = (await this.get(STORAGE_KEYS.SESSION_HISTORY)) || [];
    const newSession = {
      ...session,
      timestamp: Date.now(),
      id: `session_${Date.now()}`,
    };
    history.unshift(newSession);
    // Keep only last 100 sessions
    if (history.length > 100) {
      history.length = 100;
    }
    return this.set(STORAGE_KEYS.SESSION_HISTORY, history);
  }

  async getSessionHistory(limit = 10) {
    const history = (await this.get(STORAGE_KEYS.SESSION_HISTORY)) || [];
    return history.slice(0, limit);
  }

  async getCachedAudio(key) {
    const cache = (await this.get(STORAGE_KEYS.CACHED_AUDIO)) || {};
    return cache[key];
  }

  async setCachedAudio(key, data) {
    const cache = (await this.get(STORAGE_KEYS.CACHED_AUDIO)) || {};
    cache[key] = {
      data,
      timestamp: Date.now(),
    };
    // Clean old cache entries (older than 7 days)
    const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    Object.keys(cache).forEach((cacheKey) => {
      if (cache[cacheKey].timestamp < weekAgo) {
        delete cache[cacheKey];
      }
    });
    return this.set(STORAGE_KEYS.CACHED_AUDIO, cache);
  }

  async getApiKeys() {
    return (await this.get(STORAGE_KEYS.API_KEYS)) || {};
  }

  async setApiKey(service, key) {
    const apiKeys = await this.getApiKeys();
    apiKeys[service] = key;
    return this.set(STORAGE_KEYS.API_KEYS, apiKeys);
  }

  async removeApiKey(service) {
    const apiKeys = await this.getApiKeys();
    delete apiKeys[service];
    return this.set(STORAGE_KEYS.API_KEYS, apiKeys);
  }

  // Storage usage monitoring
  async getStorageUsage() {
    return new Promise((resolve) => {
      this.storage.getBytesInUse(null, (bytesInUse) => {
        const quotaBytes = chrome.storage.local.QUOTA_BYTES || 10485760; // 10MB default
        resolve({
          used: bytesInUse,
          total: quotaBytes,
          percentage: (bytesInUse / quotaBytes) * 100,
        });
      });
    });
  }

  // Export/Import functionality for backup
  async exportData() {
    const keys = Object.values(STORAGE_KEYS);
    const data = {};
    for (const key of keys) {
      data[key] = await this.get(key);
    }
    return data;
  }

  async importData(data) {
    const keys = Object.values(STORAGE_KEYS);
    for (const key of keys) {
      if (data[key] !== undefined) {
        await this.set(key, data[key]);
      }
    }
    return true;
  }
}

export default new StorageManager();