import React, { useState, useEffect } from 'react';

const FocusStreak = ({ data }) => {
  const [streakData, setStreakData] = useState(data || {
    current: 0,
    today: 0,
    yesterday: 0,
    weeklyGoal: 35,
    weekly: 0
  });

  // Update from props if provided
  useEffect(() => {
    if (data) {
      console.log('FocusStreak received data via props:', data);
      setStreakData(current => ({
        ...current,
        ...data
      }));
    }
  }, [data]);

  // Load streak data if not provided via props
  useEffect(() => {
    if (!data) {
      console.log('No streak data via props, calculating from sessions');

      const calculateStreakData = () => {
        chrome.storage.local.get(['focusSessions', 'settings'], (result) => {
          console.log('Retrieved data for streak calculations:', result);

          const sessions = result.focusSessions || [];

          // Default weekly goal is 35 pomodoros (7 hours)
          const weeklyGoal = result.settings?.weeklyGoal || 35;

          // Calculate dates
          const now = new Date();
          const today = new Date(now);
          today.setHours(0, 0, 0, 0);

          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);

          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Start week on Sunday

          // Filter completed pomodoro sessions
          const completedSessions = sessions.filter(session =>
            session.type === 'POMODORO' && session.completed
          );

          // Calculate today's and yesterday's sessions
          const todaySessions = completedSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= today;
          }).length;

          const yesterdaySessions = completedSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= yesterday && sessionDate < today;
          }).length;

          // Calculate weekly sessions
          const weeklySessions = completedSessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= startOfWeek;
          }).length;

          // Calculate current streak
          // Find out how many consecutive days the user has completed at least one pomodoro
          let currentStreak = 0;
          let checkDate = new Date(today);
          let foundSessions = false;

          do {
            const startOfDay = new Date(checkDate);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(checkDate);
            endOfDay.setHours(23, 59, 59, 999);

            // Check if there are any completed sessions on this day
            foundSessions = completedSessions.some(session => {
              const sessionDate = new Date(session.startTime);
              return sessionDate >= startOfDay && sessionDate <= endOfDay;
            });

            if (foundSessions) {
              currentStreak++;
              // Move to previous day
              checkDate.setDate(checkDate.getDate() - 1);
            }
          } while (foundSessions);

          // Adjust current streak for today
          if (todaySessions === 0 && currentStreak > 0) {
            currentStreak--;
          }

          // Update state
          const newStreakData = {
            current: currentStreak,
            today: todaySessions,
            yesterday: yesterdaySessions,
            weeklyGoal,
            weekly: weeklySessions
          };

          console.log('Calculated streak data:', newStreakData);
          setStreakData(newStreakData);

          // Save streak data to storage for other components
          chrome.storage.local.set({
            focusStreak: newStreakData
          });
        });
      };

      // Calculate streak data initially
      calculateStreakData();

      // Set up listener for changes
      const handleStorageChange = (changes, area) => {
        if (area === 'local' && (changes.focusSessions || changes.settings)) {
          console.log('Storage changes detected, recalculating streak');
          calculateStreakData();
        }
      };

      chrome.storage.onChanged.addListener(handleStorageChange);

      return () => {
        chrome.storage.onChanged.removeListener(handleStorageChange);
      };
    }
  }, [data]);

  // Calculate percentage of weekly goal completed
  const weeklyProgress = Math.min(Math.round((streakData.weekly / streakData.weeklyGoal) * 100), 100);

  return (
    <div className="focus-streak-container">
      <div className="streak-stats">
        <div className="streak-card">
          <h3>Current Streak</h3>
          <div className="streak-value">{streakData.current} {streakData.current === 1 ? 'day' : 'days'}</div>
        </div>

        <div className="streak-card">
          <h3>Today</h3>
          <div className="streak-value">{streakData.today} {streakData.today === 1 ? 'session' : 'sessions'}</div>
        </div>

        <div className="streak-card">
          <h3>Yesterday</h3>
          <div className="streak-value">{streakData.yesterday} {streakData.yesterday === 1 ? 'session' : 'sessions'}</div>
        </div>
      </div>

      <div className="weekly-goal">
        <h3>Weekly Goal: {streakData.weekly}/{streakData.weeklyGoal} sessions</h3>
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${weeklyProgress}%` }}
          ></div>
        </div>
        <div className="progress-text">{weeklyProgress}% complete</div>
      </div>
    </div>
  );
};

export default FocusStreak;