// This runs in the background and manages notifications and focus sessions

let blockedNotifications = [];
let isFocusModeActive = false; // Global state to track focus mode

// Initialize extension
chrome.runtime.onInstalled.addListener(() => {
  console.log('LockIn extension installed');

  // Set default settings and clear any existing notifications
  chrome.storage.local.set({
    notificationSettings: {
      allowFrom: ['Gmail'], // Default allowed notifications
      enableDuringBreaks: true
    },
    notifications: [],
    blockedNotifications: [],
    notificationStats: { gmail: 0, calendar: 0 }
  });

  // Only initialize tasks if they don't already exist
  chrome.storage.local.get(['tasks'], (result) => {
    if (!result.tasks) {
      chrome.storage.local.set({
        focusSessions: [],
        tasks: {
          inProgress: [],
          toDo: [],
          completed: [],
          backlog: []
        }
      });
    }
  });

  // Set up notification monitoring
  setupNotificationBlocking();
});

// Set up more aggressive notification blocking
function setupNotificationBlocking() {
  // Override the notifications API
  if (chrome.notifications) {
    console.log('Setting up notification interception');

    // Save original function
    const originalCreate = chrome.notifications.create;

    // Override create function
    chrome.notifications.create = function() {
      const args = Array.from(arguments);
      let notificationId, options, callback;

      // Handle different function signatures
      if (args.length === 1) {
        options = args[0];
      } else if (args.length === 2) {
        if (typeof args[1] === 'function') {
          options = args[0];
          callback = args[1];
        } else {
          notificationId = args[0];
          options = args[1];
        }
      } else if (args.length === 3) {
        notificationId = args[0];
        options = args[1];
        callback = args[2];
      }

      // Only block if this isn't our own notification
      if (notificationId === 'focus-mode-notification' ||
          notificationId === 'timer-completed-notification' ||
          options?.title === 'Focus Mode Activated' ||
          options?.title?.includes('Completed')) {
        // Allow our own notifications through
        if (notificationId) {
          originalCreate(notificationId, options, callback);
        } else if (callback) {
          originalCreate(options, callback);
        } else {
          originalCreate(options);
        }
        return;
      }

      // Check focus mode status before creating notification
      shouldBlockNotification('System').then(shouldBlock => {
        // If we should block, don't show notification
        if (shouldBlock) {
          console.log('Blocking notification in focus mode:', options?.title);

          // Track blocked notification
          blockNotification({
            source: 'System',
            message: options?.title || 'Notification blocked',
            details: options?.message || ''
          });

          if (callback) callback(''); // Empty ID means creation failed/was blocked
          return;
        }

        // Otherwise create the notification as normal
        if (notificationId) {
          originalCreate(notificationId, options, callback);
        } else if (callback) {
          originalCreate(options, callback);
        } else {
          originalCreate(options);
        }
      });
    };
  }
}

// Handle messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('Received message:', message.action);
  if (message.action === 'START_POMODORO') {
    startFocusSession(message.taskId, message.timerType);
  } else if (message.action === 'PAUSE_POMODORO') {
    pauseFocusSession();
  } else if (message.action === 'RESUME_POMODORO') {
    resumeFocusSession();
  } else if (message.action === 'END_POMODORO') {
    endFocusSession();
  } else if (message.action === 'TIMER_COMPLETED') {
    handleTimerCompleted(message.timerType, message.taskId);
  } else if (message.action === 'CLEAR_NOTIFICATIONS') {
    clearNotifications();
  } else if (message.action === 'CHECK_FOCUS_MODE') {
    // Allow components to check focus mode status
    shouldBlockNotification(message.source || 'System').then(shouldBlock => {
      sendResponse({isBlocking: shouldBlock});
    });
    return true; // Keep connection open for async response
  }
});

// Clear all notifications
function clearNotifications() {
  chrome.storage.local.set({
    notifications: [],
    notificationStats: { gmail: 0, calendar: 0 }
  });
}

// Start a focus session
function startFocusSession(taskId, timerType = 'POMODORO') {
  console.log('Starting focus session:', timerType);

  // Get current timer state
  chrome.storage.local.get(['timerState'], (result) => {
    let duration = 25 * 60 * 1000; // Default to 25 minutes

    if (timerType === 'SHORT_BREAK') {
      duration = 5 * 60 * 1000;
    } else if (timerType === 'LONG_BREAK') {
      duration = 15 * 60 * 1000;
    }

    const now = Date.now();
    const endTime = now + duration;

    // Set global focus mode state
    isFocusModeActive = true;

    // Create or update the timer state
    const timerState = {
      savedType: timerType || 'POMODORO',
      savedMinutes: Math.floor(duration / 60000),
      savedSeconds: 0,
      savedIsActive: true,
      endTime: endTime,
      pausedAt: null,
      taskId: taskId
    };

    // Save to storage
    chrome.storage.local.set({
      timerState,
      activeTimer: taskId
    });

    // Create an alarm for when the session ends
    chrome.alarms.clear('pomodoroEnd');
    chrome.alarms.create('pomodoroEnd', {
      when: endTime
    });

    // Create our own system notification (we can control this one)
    chrome.notifications.create('focus-mode-notification', {
      type: 'basic',
      iconUrl: '/assets/icons/icon128.png',
      title: 'Focus Mode Activated',
      message: 'Notifications will be filtered for the next ' + (timerState.savedMinutes) + ' minutes.'
    });

    // Update badge to show focus mode is on
    chrome.action.setBadgeText({ text: 'ON' });
    chrome.action.setBadgeBackgroundColor({ color: '#F87060' });
  });
}

// Pause a focus session
function pauseFocusSession() {
  console.log('Pausing focus session');

  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState && result.timerState.savedIsActive) {
      // Calculate remaining time
      const now = Date.now();
      const remainingMs = Math.max(0, result.timerState.endTime - now);
      const mins = Math.floor(remainingMs / 60000);
      const secs = Math.floor((remainingMs % 60000) / 1000);

      // Update timer state to paused
      const updatedTimerState = {
        ...result.timerState,
        savedIsActive: false,
        savedMinutes: mins,
        savedSeconds: secs,
        endTime: null,
        pausedAt: now
      };

      // Update global state
      isFocusModeActive = false;

      chrome.storage.local.set({ timerState: updatedTimerState });

      // Clear the alarm
      chrome.alarms.clear('pomodoroEnd');

      // Update badge
      chrome.action.setBadgeText({ text: 'PAUSE' });
    }
  });
}

// Resume a paused session
function resumeFocusSession() {
  console.log('Resuming focus session');

  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState && !result.timerState.savedIsActive) {
      const now = Date.now();
      const remainingMs = (result.timerState.savedMinutes * 60 + result.timerState.savedSeconds) * 1000;
      const endTime = now + remainingMs;

      // Update global state
      isFocusModeActive = true;

      // Update timer state to active
      const updatedTimerState = {
        ...result.timerState,
        savedIsActive: true,
        endTime: endTime,
        pausedAt: null
      };

      chrome.storage.local.set({ timerState: updatedTimerState });

      // Create a new alarm
      chrome.alarms.create('pomodoroEnd', {
        when: endTime
      });

      // Update badge
      chrome.action.setBadgeText({ text: 'ON' });
    }
  });
}

// End a focus session
function endFocusSession() {
  console.log('Ending focus session');

  chrome.storage.local.get(['timerState'], (result) => {
    if (result.timerState) {
      const timerType = result.timerState.savedType || 'POMODORO';
      let newDuration = 25;

      if (timerType === 'SHORT_BREAK') {
        newDuration = 5;
      } else if (timerType === 'LONG_BREAK') {
        newDuration = 15;
      }

      // Update global state
      isFocusModeActive = false;

      // Reset the timer state
      const resetTimerState = {
        savedType: timerType,
        savedMinutes: newDuration,
        savedSeconds: 0,
        savedIsActive: false,
        endTime: null,
        pausedAt: Date.now(),
        taskId: result.timerState.taskId
      };

      chrome.storage.local.set({ timerState: resetTimerState });

      // Clear the alarm
      chrome.alarms.clear('pomodoroEnd');

      // Update badge
      chrome.action.setBadgeText({ text: '' });
    }
  });
}

// Handle timer completion
function handleTimerCompleted(timerType, taskId) {
  console.log('Timer completed:', timerType);

  // Update global state if this was a pomodoro
  if (timerType === 'POMODORO') {
    isFocusModeActive = false;

    // Just set the timer to inactive
    endFocusSession();
  }

  // Create our own notification (we can control this one)
  chrome.notifications.create('timer-completed-notification', {
    type: 'basic',
    iconUrl: '/assets/icons/icon128.png',
    title: `${timerType} Completed!`,
    message: timerType === 'POMODORO' ? 'Time for a break!' : 'Ready to focus again?'
  });

  // Update badge
  chrome.action.setBadgeText({ text: '' });
}

// Listen for alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'pomodoroEnd') {
    console.log('Pomodoro end alarm triggered');

    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState && result.timerState.savedIsActive) {
        const timerType = result.timerState.savedType || 'POMODORO';
        const taskId = result.timerState.taskId;

        handleTimerCompleted(timerType, taskId);
      }
    });
  }
});

// Handle notification monitoring - Gmail and Calendar
const notificationSources = {
  gmail: {
    urlPattern: /mail\.google\.com/,
    extractDetails: (url, title) => ({
      source: 'Gmail',
      message: title || 'New Gmail notification',
      link: url
    })
  },
  calendar: {
    urlPattern: /calendar\.google\.com/,
    extractDetails: (url, title) => ({
      source: 'Calendar',
      message: title ? title.replace('Google Calendar -', '').trim() : 'New Calendar notification',
      link: url
    })
  }
};

// Monitor completed requests for notification tracking
chrome.webRequest.onCompleted.addListener(
  (details) => {
    // Check quickly if we're in focus mode
    if (!isFocusModeActive) return;

    // Only process if this is a potential notification request
    if (details.url.includes('notifications') ||
        details.url.includes('mail/u') ||
        details.url.includes('calendar/event') ||
        details.url.includes('push') ||
        details.url.includes('alert')) {

      const url = details.url;
      let source = 'Unknown';

      // Determine the source
      for (const sourceName in notificationSources) {
        if (notificationSources[sourceName].urlPattern.test(url)) {
          source = sourceName === 'gmail' ? 'Gmail' : 'Calendar';

          // Get tab details if available
          if (details.tabId > 0) {
            chrome.tabs.get(details.tabId, (tab) => {
              if (!tab || !tab.title) return;

              const notificationDetails = notificationSources[sourceName].extractDetails(url, tab.title);

              // Check if this notification should be blocked or allowed
              shouldBlockNotification(notificationDetails.source).then(shouldBlock => {
                if (shouldBlock) {
                  blockNotification(notificationDetails);
                } else {
                  allowNotification(notificationDetails);
                }
              });
            });
          } else {
            // No tab available, use basic details
            const basicDetails = {
              source: source,
              message: `Potential ${source} notification`,
              link: url
            };

            shouldBlockNotification(source).then(shouldBlock => {
              if (shouldBlock) {
                blockNotification(basicDetails);
              } else {
                allowNotification(basicDetails);
              }
            });
          }
          break;
        }
      }
    }
  },
  { urls: ["*://*.google.com/*"] }
);

// Determine if a notification should be blocked
function shouldBlockNotification(source) {
  // Use cached global state for quick check - allow if not in focus mode
  if (!isFocusModeActive) {
    return Promise.resolve(false);
  }

  return new Promise((resolve) => {
    chrome.storage.local.get(['timerState', 'notificationSettings'], (result) => {
      // Get notification settings
      const settings = result.notificationSettings || {
        allowFrom: ['Gmail'],
        enableDuringBreaks: true
      };

      // Check if focus mode is active
      if (!result.timerState || !result.timerState.savedIsActive) {
        resolve(false);
        return;
      }

      // Check if this is a break session
      const isBreak = result.timerState.savedType === 'SHORT_BREAK' ||
                      result.timerState.savedType === 'LONG_BREAK';

      // If this is a break and enableDuringBreaks is true, allow the notification
      if (isBreak && settings.enableDuringBreaks) {
        resolve(false);
        return;
      }

      // Check if the source is in the allowFrom list
      const isAllowed = settings.allowFrom.includes(source);

      // Block if not in allowed sources
      resolve(!isAllowed);
    });
  });
}

// Track notification counts for the overview
function updateNotificationStats(source) {
  chrome.storage.local.get(['notificationStats'], (result) => {
    const stats = result.notificationStats || { gmail: 0, calendar: 0 };

    // Increment the appropriate counter
    if (source === 'Gmail') {
      stats.gmail++;
    } else if (source === 'Calendar') {
      stats.calendar++;
    }

    // Save the updated stats to storage
    chrome.storage.local.set({ notificationStats: stats });
  });
}

// Block a notification during focus mode
function blockNotification(details) {
  console.log('Blocking notification:', details);

  // Add to blocked notifications list
  chrome.storage.local.get(['blockedNotifications'], (result) => {
    const blocked = result.blockedNotifications || [];
    const newBlocked = [...blocked, {
      ...details,
      time: Date.now(),
      id: Date.now().toString()
    }];

    chrome.storage.local.set({ blockedNotifications: newBlocked });
  });
}

// Allow a notification to come through
function allowNotification(details) {
  console.log('Allowing notification:', details);

  // This is a new notification, add it to the list
  chrome.storage.local.get(['notifications'], (result) => {
    const notifications = result.notifications || [];

    // Only add if it's a new notification (check if message already exists to prevent duplicates)
    const isDuplicate = notifications.some(n =>
      n.source === details.source &&
      n.message === details.message &&
      // Only check messages from the last 10 seconds
      Date.now() - n.time < 10000
    );

    if (!isDuplicate) {
      // Add the new notification
      const newNotification = {
        ...details,
        time: Date.now(),
        id: Date.now().toString()
      };

      const updatedNotifications = [...notifications, newNotification];

      // Save to storage
      chrome.storage.local.set({ notifications: updatedNotifications });

      // Update notification stats
      updateNotificationStats(details.source);
    }
  });
}