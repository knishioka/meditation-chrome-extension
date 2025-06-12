import { MESSAGE_TYPES, STORAGE_KEYS } from '@config/constants';
import storageManager from '@lib/storage-manager';
import audioManager from '@lib/audio-manager';
import meditationContent from '@lib/meditation-content';

// Service worker lifecycle
self.addEventListener('install', (event) => {
  console.log('Service worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service worker activated');
  event.waitUntil(clients.claim());
});

// Message handling
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  handleMessage(message, sender)
    .then(sendResponse)
    .catch((error) => {
      console.error('Error handling message:', error);
      sendResponse({ error: error.message });
    });
  return true; // Keep the message channel open for async response
});

export async function handleMessage(message, sender) {
  const { type, data } = message;

  switch (type) {
    case MESSAGE_TYPES.PLAY_AUDIO:
      return handlePlayAudio(data);
    
    case MESSAGE_TYPES.STOP_AUDIO:
      return audioManager.stopAudio();
    
    case MESSAGE_TYPES.PAUSE_AUDIO:
      return audioManager.pauseAudio();
    
    case MESSAGE_TYPES.RESUME_AUDIO:
      return audioManager.resumeAudio();
    
    case MESSAGE_TYPES.SET_VOLUME:
      return audioManager.setVolume(data.type, data.value);
    
    case MESSAGE_TYPES.GET_AUDIO_STATUS:
      return audioManager.getAudioStatus();
    
    case MESSAGE_TYPES.SESSION_COMPLETE:
      return handleSessionComplete(data);
    
    default:
      throw new Error(`Unknown message type: ${type}`);
  }
}

async function handlePlayAudio(data) {
  try {
    // Get user preferences
    const preferences = await storageManager.getUserPreferences();
    
    // Get meditation script
    const script = meditationContent.getScript(
      preferences.meditationType,
      preferences.language,
      preferences.duration
    );
    
    // Create session configuration
    const sessionConfig = audioManager.createSessionConfig(preferences, script);
    
    // Start meditation session
    const result = await audioManager.playMeditation(sessionConfig);
    
    // Save session start to history
    await storageManager.addSessionToHistory({
      type: preferences.meditationType,
      duration: preferences.duration * 60 * 1000,
      language: preferences.language,
      backgroundSound: preferences.backgroundSound,
      started: true,
      completed: false,
    });
    
    return result;
  } catch (error) {
    console.error('Error starting meditation:', error);
    throw error;
  }
}

async function handleSessionComplete(data) {
  try {
    // Update session history with completion
    const history = await storageManager.getSessionHistory(1);
    if (history.length > 0 && !history[0].completed) {
      history[0].completed = true;
      history[0].completedAt = Date.now();
      await storageManager.set(STORAGE_KEYS.SESSION_HISTORY, history);
    }
    
    // Show notification if enabled
    const preferences = await storageManager.getUserPreferences();
    if (preferences.notificationsEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: chrome.i18n.getMessage('session_complete'),
        message: chrome.i18n.getMessage('session_complete_message'),
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling session complete:', error);
    throw error;
  }
}

// Extension icon click handler
chrome.action.onClicked.addListener(async (tab) => {
  // This won't be called if we have a default_popup in manifest
  // But keeping it for potential future use
  console.log('Extension icon clicked');
});

// Alarm handling for reminders
chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name === 'meditation-reminder') {
    const preferences = await storageManager.getUserPreferences();
    if (preferences.remindersEnabled) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: chrome.runtime.getURL('icons/icon-128.png'),
        title: chrome.i18n.getMessage('reminder_title'),
        message: chrome.i18n.getMessage('reminder_message'),
        buttons: [
          { title: chrome.i18n.getMessage('start_now') },
          { title: chrome.i18n.getMessage('snooze') },
        ],
      });
    }
  }
});

// Notification button click handler
chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
  if (buttonIndex === 0) {
    // Start now - open popup
    chrome.action.openPopup();
  } else if (buttonIndex === 1) {
    // Snooze - set alarm for 30 minutes
    chrome.alarms.create('meditation-reminder', { delayInMinutes: 30 });
  }
  chrome.notifications.clear(notificationId);
});

// Storage change listener
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[STORAGE_KEYS.USER_PREFERENCES]) {
    const newPreferences = changes[STORAGE_KEYS.USER_PREFERENCES].newValue;
    console.log('User preferences updated:', newPreferences);
    
    // Update reminders if needed
    if (newPreferences.remindersEnabled && newPreferences.reminderTime) {
      setupDailyReminder(newPreferences.reminderTime);
    } else {
      chrome.alarms.clear('meditation-reminder');
    }
  }
});

// Helper function to set up daily reminder
function setupDailyReminder(timeString) {
  const [hours, minutes] = timeString.split(':').map(Number);
  const now = new Date();
  const alarm = new Date();
  alarm.setHours(hours, minutes, 0, 0);
  
  // If the time has already passed today, set for tomorrow
  if (alarm <= now) {
    alarm.setDate(alarm.getDate() + 1);
  }
  
  chrome.alarms.create('meditation-reminder', {
    when: alarm.getTime(),
    periodInMinutes: 24 * 60, // Daily
  });
}

// Context menu for quick meditation
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'quick-meditation',
    title: chrome.i18n.getMessage('quick_meditation'),
    contexts: ['all'],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'quick-meditation') {
    chrome.action.openPopup();
  }
});

// Error boundary
self.addEventListener('error', (event) => {
  console.error('Service worker error:', event.error);
});

self.addEventListener('unhandledrejection', (event) => {
  console.error('Service worker unhandled rejection:', event.reason);
});

// Cleanup on uninstall
chrome.runtime.onSuspend.addListener(() => {
  audioManager.cleanup();
});