// Utility functions for tracking and analyzing focus sessions

// Track a completed focus session
export const trackFocusSession = (sessionData) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusSessions'], (result) => {
        const sessions = result.focusSessions || [];

        // Add the new session
        const updatedSessions = [...sessions, {
          ...sessionData,
          id: Date.now().toString(),
          completed: true
        }];

        // Limit storage to last 500 sessions to avoid performance issues
        const limitedSessions = updatedSessions.slice(-500);

        chrome.storage.local.set(
          { focusSessions: limitedSessions },
          () => resolve(limitedSessions)
        );
      });
    });
  };

  // Track when a session is started
  export const trackSessionStart = (taskId, timerType) => {
    return new Promise((resolve) => {
      // Create session object
      const session = {
        id: Date.now().toString(),
        taskId,
        type: timerType,
        startTime: Date.now(),
        completed: false
      };

      // Save to storage
      chrome.storage.local.get(['currentSession'], (result) => {
        chrome.storage.local.set({ currentSession: session }, () => resolve(session));
      });
    });
  };

  // Track when a session is completed
  export const trackSessionComplete = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['currentSession', 'settings'], (result) => {
        if (!result.currentSession) {
          resolve(null);
          return;
        }

        const session = result.currentSession;
        const settings = result.settings || {};

        // Calculate duration based on settings
        let duration;
        if (session.type === 'POMODORO') {
          duration = settings.pomodoroMinutes || 25;
        } else if (session.type === 'SHORT_BREAK') {
          duration = settings.shortBreakMinutes || 5;
        } else if (session.type === 'LONG_BREAK') {
          duration = settings.longBreakMinutes || 15;
        }

        // Update session data
        const completedSession = {
          ...session,
          endTime: Date.now(),
          duration,
          completed: true
        };

        // Only track completed POMODORO sessions in the focusSessions array
        if (session.type === 'POMODORO') {
          trackFocusSession(completedSession).then(() => {
            // Clear current session
            chrome.storage.local.remove(['currentSession']);
            resolve(completedSession);
          });
        } else {
          // For breaks, just clear the current session
          chrome.storage.local.remove(['currentSession']);
          resolve(completedSession);
        }
      });
    });
  };

  // Get a summary of focus time
  export const getFocusTimeSummary = () => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusSessions'], (result) => {
        const sessions = result.focusSessions || [];

        // Calculate dates
        const now = new Date();
        const today = new Date(now);
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        const startOfMonth = new Date(today);
        startOfMonth.setDate(1);

        // Filter completed pomodoro sessions
        const completedSessions = sessions.filter(
          session => session.type === 'POMODORO' && session.completed
        );

        // Calculate focus time (in minutes)
        const calculateFocusTime = (sessionList) => {
          return sessionList.reduce((total, session) => {
            const duration = session.duration || 25; // Default to 25 minutes
            return total + duration;
          }, 0);
        };

        // Filter sessions by time period
        const todaySessions = completedSessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= today;
        });

        const yesterdaySessions = completedSessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= yesterday && sessionDate < today;
        });

        const weekSessions = completedSessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startOfWeek;
        });

        const monthSessions = completedSessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startOfMonth;
        });

        // Build summary object
        const summary = {
          today: {
            sessions: todaySessions.length,
            focusTime: calculateFocusTime(todaySessions)
          },
          yesterday: {
            sessions: yesterdaySessions.length,
            focusTime: calculateFocusTime(yesterdaySessions)
          },
          week: {
            sessions: weekSessions.length,
            focusTime: calculateFocusTime(weekSessions)
          },
          month: {
            sessions: monthSessions.length,
            focusTime: calculateFocusTime(monthSessions)
          },
          allTime: {
            sessions: completedSessions.length,
            focusTime: calculateFocusTime(completedSessions)
          }
        };

        resolve(summary);
      });
    });
  };

  // Get daily stats for a given date range
  export const getDailyStats = (days = 7) => {
    return new Promise((resolve) => {
      chrome.storage.local.get(['focusSessions'], (result) => {
        const sessions = result.focusSessions || [];
        const completedSessions = sessions.filter(
          session => session.type === 'POMODORO' && session.completed
        );

        // Calculate today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Generate daily stats
        const dailyStats = [];
        for (let i = days - 1; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const dayStart = new Date(date);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          // Filter sessions for this day
          const daySessions = completedSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= dayStart && sessionDate <= dayEnd;
          });

          // Calculate focus time
          const focusTime = daySessions.reduce((total, session) => {
            return total + (session.duration || 25);
          }, 0);

          // Add to daily stats
          dailyStats.push({
            date: date.toISOString().split('T')[0],
            displayDate: date.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' }),
            focusTime,
            sessions: daySessions.length
          });
        }

        resolve(dailyStats);
      });
    });
  };

  // Export all functions
  export default {
    trackFocusSession,
    trackSessionStart,
    trackSessionComplete,
    getFocusTimeSummary,
    getDailyStats
  };