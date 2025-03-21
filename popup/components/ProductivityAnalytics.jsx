import React, { useState, useEffect } from 'react';

const ProductivityAnalytics = () => {
  const [analyticsData, setAnalyticsData] = useState({
    todayFocusTime: 0,
    weekFocusTime: 0,
    totalSessions: 0,
    completedTasks: 0,
    dailyStats: []
  });

  // Load analytics data from storage
  useEffect(() => {
    const loadAnalyticsData = () => {
      console.log('Loading analytics data');
      chrome.storage.local.get(['focusSessions', 'tasks'], (result) => {
        console.log('Retrieved data from storage:', result);
        const sessions = result.focusSessions || [];
        const tasks = result.tasks || { completed: [] };

        // Calculate today's date (start of day)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        // Calculate start of week (Sunday)
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());

        // Filter sessions for today and this week
        const todaySessions = sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= today;
        });

        const weekSessions = sessions.filter(session => {
          const sessionDate = new Date(session.startTime);
          return sessionDate >= startOfWeek;
        });

        // Calculate focus time (in minutes)
        const calculateFocusTime = (sessionList) => {
          return sessionList.reduce((total, session) => {
            if (session.type === 'POMODORO' && session.completed) {
              // Use session duration or calculate it if not available
              const duration = session.duration ||
                (session.endTime - session.startTime) / (60 * 1000);
              return total + duration;
            }
            return total;
          }, 0);
        };

        const todayFocusTime = calculateFocusTime(todaySessions);
        const weekFocusTime = calculateFocusTime(weekSessions);

        // Count total completed sessions
        const totalSessions = sessions.filter(
          session => session.type === 'POMODORO' && session.completed
        ).length;

        // Count completed tasks
        const completedTasks = tasks.completed ? tasks.completed.length : 0;

        // Generate daily stats for the last 7 days
        const dailyStats = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date(today);
          date.setDate(today.getDate() - i);

          const dayStart = new Date(date);
          const dayEnd = new Date(date);
          dayEnd.setHours(23, 59, 59, 999);

          // Filter sessions for this day
          const daySessions = sessions.filter(session => {
            const sessionDate = new Date(session.startTime);
            return sessionDate >= dayStart && sessionDate <= dayEnd &&
                   session.type === 'POMODORO' && session.completed;
          });

          // Calculate focus time for this day
          const dayFocusTime = calculateFocusTime(daySessions);

          // Add to daily stats
          dailyStats.push({
            date: date.toLocaleDateString('en-US', { weekday: 'short' }),
            focusTime: Math.round(dayFocusTime),
            sessions: daySessions.length
          });
        }

        // Update state
        setAnalyticsData({
          todayFocusTime: Math.round(todayFocusTime),
          weekFocusTime: Math.round(weekFocusTime),
          totalSessions,
          completedTasks,
          dailyStats
        });

        console.log('Analytics data processed:', {
          todayFocusTime: Math.round(todayFocusTime),
          weekFocusTime: Math.round(weekFocusTime),
          totalSessions,
          completedTasks,
          dailyStats
        });
      });
    };

    // Load data initially
    loadAnalyticsData();

    // Set up listener for changes
    const handleStorageChange = (changes, area) => {
      if (area === 'local' && (changes.focusSessions || changes.tasks)) {
        console.log('Storage changes detected, reloading analytics');
        loadAnalyticsData();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Format minutes as hours and minutes
  const formatTime = (minutes) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (remainingMinutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${remainingMinutes} min`;
    }
  };

  // Calculate max value for the chart
  const maxFocusTime = Math.max(...analyticsData.dailyStats.map(day => day.focusTime), 60);

  return (
    <div className="analytics-container">
      <div className="analytics-summary">
        <div className="analytics-metric">
          <h3>Today's Focus</h3>
          <span className="metric-value">{formatTime(analyticsData.todayFocusTime)}</span>
        </div>

        <div className="analytics-metric">
          <h3>This Week</h3>
          <span className="metric-value">{formatTime(analyticsData.weekFocusTime)}</span>
        </div>

        <div className="analytics-metric">
          <h3>Total Sessions</h3>
          <span className="metric-value">{analyticsData.totalSessions}</span>
        </div>

        <div className="analytics-metric">
          <h3>Completed Tasks</h3>
          <span className="metric-value">{analyticsData.completedTasks}</span>
        </div>
      </div>

      <div className="daily-chart">
        {analyticsData.dailyStats.map((day, index) => (
          <div key={index} className="chart-bar-container">
            <div className="chart-bar-wrapper">
              <div
                className="chart-bar"
                style={{
                  height: `${Math.max((day.focusTime / maxFocusTime) * 100, 5)}%`,
                  backgroundColor: day.focusTime > 0 ? 'var(--primary-color)' : '#e0e0e0'
                }}
              ></div>
            </div>
            <div className="chart-label">{day.date}</div>
            <div className="chart-value">{day.focusTime > 0 ? `${day.focusTime}m` : ''}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductivityAnalytics;