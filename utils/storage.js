// Utility functions for managing Chrome storage

// Get a value from storage with a default fallback
export const getValue = (key, defaultValue = null) => {
    return new Promise((resolve) => {
      chrome.storage.local.get([key], (result) => {
        resolve(result[key] !== undefined ? result[key] : defaultValue);
      });
    });
  };

  // Set a value in storage
  export const setValue = (key, value) => {
    return new Promise((resolve) => {
      const data = {};
      data[key] = value;
      chrome.storage.local.set(data, () => resolve(value));
    });
  };

  // Get multiple values from storage
  export const getMultipleValues = (keys) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(keys, (result) => {
        resolve(result);
      });
    });
  };

  // Set multiple values in storage
  export const setMultipleValues = (data) => {
    return new Promise((resolve) => {
      chrome.storage.local.set(data, () => resolve(data));
    });
  };

  // Delete a value from storage
  export const removeValue = (key) => {
    return new Promise((resolve) => {
      chrome.storage.local.remove(key, () => resolve());
    });
  };

  // Clear all storage (use with caution)
  export const clearStorage = () => {
    return new Promise((resolve) => {
      chrome.storage.local.clear(() => resolve());
    });
  };

  // Initialize default settings if not present
  export const initializeDefaultSettings = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings'], (result) => {
        if (!result.settings) {
          const defaultSettings = {
            // Timer defaults
            pomodoroMinutes: 25,
            shortBreakMinutes: 5,
            longBreakMinutes: 15,

            // Sound defaults
            notificationSound: 'bell',
            notificationVolume: 70,
            enableSounds: true,

            // Other defaults
            autoStartBreaks: true,
            autoStartPomodoros: false,
            longBreakInterval: 4,
            weeklyGoal: 35
          };

          chrome.storage.local.set({ settings: defaultSettings }, () => {
            resolve(defaultSettings);
          });
        } else {
          resolve(result.settings);
        }
      });
    });
  };

  // Add notification sound support
  export const playSoundNotification = (soundType = 'bell', volume = 70) => {
    return new Promise((resolve, reject) => {
      // Get settings first
      chrome.storage.local.get(['settings'], (result) => {
        const settings = result.settings || {};

        // Check if sounds are enabled
        if (settings.enableSounds === false) {
          resolve(false);
          return;
        }

        // Use specified sound or default from settings
        const sound = soundType || settings.notificationSound || 'bell';
        // Use specified volume or default from settings
        const soundVolume = volume !== undefined ? volume : (settings.notificationVolume || 70);

        try {
          // Create audio element
          const audio = new Audio(`/assets/sounds/${sound}.mp3`);
          audio.volume = soundVolume / 100;

          // Play sound
          audio.play().then(() => {
            resolve(true);
          }).catch((error) => {
            console.error('Error playing sound:', error);
            reject(error);
          });
        } catch (error) {
          console.error('Error creating audio element:', error);
          reject(error);
        }
      });
    });
  };

  // Get timer settings
  export const getTimerSettings = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['settings', 'timerState'], (result) => {
        const settings = result.settings || {};
        const timerState = result.timerState;

        // Combine settings and timer state
        const timerSettings = {
          pomodoro: settings.pomodoroMinutes || 25,
          shortBreak: settings.shortBreakMinutes || 5,
          longBreak: settings.longBreakMinutes || 15,
          autoStartBreaks: settings.autoStartBreaks !== false, // Default to true
          autoStartPomodoros: settings.autoStartPomodoros || false,
          longBreakInterval: settings.longBreakInterval || 4,
          currentState: timerState
        };

        resolve(timerSettings);
      });
    });
  };

  // Export all functions
  export default {
    getValue,
    setValue,
    getMultipleValues,
    setMultipleValues,
    removeValue,
    clearStorage,
    initializeDefaultSettings,
    playSoundNotification,
    getTimerSettings
  };