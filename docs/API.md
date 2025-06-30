# API Documentation

## Overview

The Meditation Chrome Extension is built with a modular architecture where each component has a specific responsibility. This document provides detailed API documentation for all public modules and their methods.

## Table of Contents

- [AudioManager](#audiomanager)
- [StorageManager](#storagemanager)
- [MeditationContent](#meditationcontent)
- [TTSService](#ttsservice)
- [Service Worker API](#service-worker-api)
- [Message Types](#message-types)
- [Chrome Extension APIs Used](#chrome-extension-apis-used)

## AudioManager

The AudioManager handles all audio-related operations through the offscreen document.

### Import
```javascript
import audioManager from '@lib/audio-manager';
```

### Methods

#### `startSession(config)`
Starts a new meditation session with audio playback.

**Parameters:**
- `config` (Object): Session configuration
  - `type` (string): Meditation type ('breath_awareness', 'body_scan', 'loving_kindness', 'mindfulness')
  - `duration` (number): Duration in milliseconds
  - `language` (string): Language code ('en' or 'ja')
  - `backgroundSound` (string): Background sound type ('nature_sounds', 'ambient_music', 'silence')
  - `voiceEnabled` (boolean): Whether to play voice guidance
  - `script` (Object): Meditation script from MeditationContent

**Returns:** Promise<Object>
- `success` (boolean): Whether the session started successfully
- `sessionId` (string): Unique session identifier

**Example:**
```javascript
const session = await audioManager.startSession({
  type: 'breath_awareness',
  duration: 600000, // 10 minutes
  language: 'en',
  backgroundSound: 'nature_sounds',
  voiceEnabled: true,
  script: meditationContent.getScript('breath_awareness', 'en', 600000)
});
```

#### `stopSession()`
Stops the current meditation session.

**Returns:** Promise<Object>
- `success` (boolean): Whether the session stopped successfully

#### `pauseSession()`
Pauses the current meditation session.

**Returns:** Promise<Object>
- `success` (boolean): Whether the session paused successfully

#### `resumeSession()`
Resumes a paused meditation session.

**Returns:** Promise<Object>
- `success` (boolean): Whether the session resumed successfully

#### `setVolume(volumeType, value)`
Sets the volume for voice or background music.

**Parameters:**
- `volumeType` (string): Either 'voice' or 'music'
- `value` (number): Volume level between 0 and 1

**Returns:** Promise<Object>
- `success` (boolean): Whether the volume was set successfully

#### `getStatus()`
Gets the current audio playback status.

**Returns:** Promise<Object>
- `isPlaying` (boolean): Whether audio is currently playing
- `isPaused` (boolean): Whether audio is paused
- `currentSession` (Object|null): Current session details
- `volumes` (Object): Current volume levels

## StorageManager

Manages all Chrome storage operations for user preferences and session data.

### Import
```javascript
import storageManager from '@lib/storage-manager';
```

### Methods

#### `getUserPreferences()`
Retrieves user preferences with defaults.

**Returns:** Promise<Object>
- All preference fields with either stored or default values

**Example:**
```javascript
const prefs = await storageManager.getUserPreferences();
// Returns: {
//   language: 'en',
//   duration: 10,
//   meditationType: 'breath_awareness',
//   backgroundSound: 'ambient_music',
//   voiceEnabled: true,
//   voiceVolume: 0.8,
//   musicVolume: 0.3,
//   voiceGender: 'neutral'
// }
```

#### `setUserPreferences(preferences)`
Updates user preferences.

**Parameters:**
- `preferences` (Object): Partial or complete preferences object

**Returns:** Promise<boolean>
- Success status

#### `updatePreference(key, value)`
Updates a single preference.

**Parameters:**
- `key` (string): Preference key
- `value` (any): New value

**Returns:** Promise<boolean>
- Success status

#### `addSessionToHistory(session)`
Adds a completed session to history.

**Parameters:**
- `session` (Object): Session data
  - `type` (string): Meditation type
  - `duration` (number): Duration in milliseconds
  - `language` (string): Language used
  - `completedAt` (number): Completion timestamp

**Returns:** Promise<boolean>
- Success status

#### `getSessionHistory(limit)`
Retrieves session history.

**Parameters:**
- `limit` (number): Maximum number of sessions to return (default: 10)

**Returns:** Promise<Array>
- Array of session objects sorted by newest first

#### `getCachedAudio(key)`
Retrieves cached audio data.

**Parameters:**
- `key` (string): Cache key

**Returns:** Promise<Object|null>
- Cached audio data or null if not found

#### `setCachedAudio(key, data)`
Stores audio data in cache.

**Parameters:**
- `key` (string): Cache key
- `data` (ArrayBuffer): Audio data

**Returns:** Promise<boolean>
- Success status

## MeditationContent

Provides meditation scripts and content management.

### Import
```javascript
import meditationContent from '@lib/meditation-content';
```

### Methods

#### `getScript(type, language, duration)`
Generates a meditation script for the specified parameters.

**Parameters:**
- `type` (string): Meditation type
- `language` (string): Language code ('en' or 'ja')
- `duration` (number): Duration in milliseconds

**Returns:** Object
- `segments` (Array): Array of script segments
  - `type` (string): Segment type ('intro', 'instruction', 'guidance', etc.)
  - `text` (string): Text content
  - `pauseAfter` (number): Pause duration in milliseconds

**Example:**
```javascript
const script = meditationContent.getScript('body_scan', 'ja', 900000);
// Returns: {
//   segments: [
//     { type: 'intro', text: 'ようこそ...', pauseAfter: 3000 },
//     { type: 'instruction', text: '快適な姿勢で...', pauseAfter: 5000 },
//     ...
//   ]
// }
```

#### `getMeditationTypes()`
Gets all available meditation types.

**Returns:** Array<Object>
- Array of meditation type objects
  - `id` (string): Type identifier
  - `name` (string): Display name
  - `description` (string): Type description

#### `getDurationOptions()`
Gets available duration options.

**Returns:** Array<number>
- Array of durations in minutes

## TTSService

Handles text-to-speech operations using local audio files.

### Import
```javascript
import ttsService from '@lib/tts-service';
```

### Methods

#### `generateSpeech(segment, language, options)`
Generates or retrieves audio for a text segment.

**Parameters:**
- `segment` (Object): Segment data
  - `type` (string): Segment type
  - `text` (string): Text content
  - `pauseAfter` (number): Pause duration
- `language` (string): Language code
- `options` (Object): Additional options

**Returns:** Promise<ArrayBuffer>
- Audio data

#### `generateSessionAudio(script, language, options)`
Generates audio for an entire meditation session.

**Parameters:**
- `script` (Object): Complete meditation script
- `language` (string): Language code
- `options` (Object): Generation options

**Returns:** Promise<Object>
- `audioSegments` (Array): Generated audio segments
- `errors` (Array): Any errors encountered
- `totalDuration` (number): Total duration in milliseconds

#### `validateAudioFiles(language)`
Validates that required audio files exist.

**Parameters:**
- `language` (string): Language code

**Returns:** Promise<Object>
- `isValid` (boolean): Whether all files exist
- `missingFiles` (Array): List of missing file paths

## Service Worker API

The service worker handles all extension background tasks and message routing.

### Message Handling

Send messages to the service worker:

```javascript
const response = await chrome.runtime.sendMessage({
  type: 'START_MEDITATION',
  data: {
    meditationType: 'breath_awareness',
    duration: 600000,
    language: 'en'
  }
});
```

### Supported Message Types

#### `START_MEDITATION`
Starts a new meditation session.

**Data:**
- `meditationType` (string): Type of meditation
- `duration` (number): Duration in milliseconds
- `language` (string): Language code

#### `STOP_MEDITATION`
Stops the current meditation session.

#### `PAUSE_MEDITATION`
Pauses the current meditation session.

#### `RESUME_MEDITATION`
Resumes a paused meditation session.

#### `GET_PREFERENCES`
Retrieves user preferences.

#### `UPDATE_PREFERENCES`
Updates user preferences.

**Data:**
- `preferences` (Object): Preferences to update

#### `GET_SESSION_HISTORY`
Retrieves meditation session history.

**Data:**
- `limit` (number): Maximum number of sessions

## Message Types

Complete list of message types used throughout the extension:

```javascript
export const MESSAGE_TYPES = {
  // Audio control
  PLAY_AUDIO: 'PLAY_AUDIO',
  STOP_AUDIO: 'STOP_AUDIO',
  PAUSE_AUDIO: 'PAUSE_AUDIO',
  RESUME_AUDIO: 'RESUME_AUDIO',
  SET_VOLUME: 'SET_VOLUME',
  PRELOAD_AUDIO: 'PRELOAD_AUDIO',
  GET_AUDIO_STATUS: 'GET_AUDIO_STATUS',
  
  // Session events
  AUDIO_ENDED: 'AUDIO_ENDED',
  AUDIO_ERROR: 'AUDIO_ERROR',
  SESSION_COMPLETE: 'SESSION_COMPLETE',
  
  // TTS
  TTS_GENERATE: 'TTS_GENERATE'
};
```

## Chrome Extension APIs Used

### Permissions Required
```json
{
  "permissions": [
    "offscreen",
    "storage",
    "alarms",
    "notifications",
    "contextMenus"
  ]
}
```

### Chrome APIs

#### `chrome.storage.local`
Used for storing user preferences and session data.

#### `chrome.offscreen`
Used for audio playback in Manifest V3.

#### `chrome.runtime`
Used for message passing between components.

#### `chrome.alarms`
Used for session timing and reminders.

#### `chrome.notifications`
Used for meditation reminders and completion notifications.

#### `chrome.contextMenus`
Used for quick access to meditation sessions.

## Error Handling

All API methods follow consistent error handling:

```javascript
try {
  const result = await audioManager.startSession(config);
  if (result.success) {
    // Handle success
  } else {
    // Handle failure
    console.error('Failed to start session:', result.error);
  }
} catch (error) {
  // Handle unexpected errors
  console.error('Unexpected error:', error);
}
```

## Events

The extension emits various events through the Chrome runtime:

```javascript
// Listen for session completion
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === MESSAGE_TYPES.SESSION_COMPLETE) {
    // Handle session completion
    console.log('Session completed:', message.data.sessionId);
  }
});
```

## Best Practices

1. **Always handle errors**: All async operations can fail
2. **Check audio file existence**: Use `validateAudioFiles()` before sessions
3. **Respect user preferences**: Always apply stored preferences
4. **Clean up resources**: Stop audio when extension is suspended
5. **Cache appropriately**: Use caching for better performance

## Examples

### Complete Session Flow

```javascript
// 1. Get user preferences
const prefs = await storageManager.getUserPreferences();

// 2. Generate meditation script
const script = meditationContent.getScript(
  prefs.meditationType,
  prefs.language,
  prefs.duration * 60 * 1000
);

// 3. Start audio session
const session = await audioManager.startSession({
  type: prefs.meditationType,
  duration: prefs.duration * 60 * 1000,
  language: prefs.language,
  backgroundSound: prefs.backgroundSound,
  voiceEnabled: prefs.voiceEnabled,
  script: script
});

// 4. Handle completion
if (session.success) {
  // Session started successfully
  console.log('Meditation started:', session.sessionId);
}
```

### Volume Control

```javascript
// Set voice volume to 60%
await audioManager.setVolume('voice', 0.6);

// Set background music to 30%
await audioManager.setVolume('music', 0.3);

// Get current status including volumes
const status = await audioManager.getStatus();
console.log('Current volumes:', status.volumes);
```