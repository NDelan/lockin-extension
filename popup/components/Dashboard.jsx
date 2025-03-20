import React, { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
import NotificationFilter from './NotificationFilter';
import NotificationsOverview from './NotificationsOverview';
import ProductivityAnalytics from './ProductivityAnalytics';
import FocusStreak from './FocusStreak';

const Dashboard = () => {
  const [focusStreak, setFocusStreak] = useState({
    yesterday: 5,
    today: 3,
    weeklyGoal: 35
  });

  const [activeTask, setActiveTask] = useState(null);
  const [timerSettings, setTimerSettings] = useState(null);

  // Get data from storage
  useEffect(() => {
    const loadStorageData = () => {
      chrome.storage.local.get(
        ['focusStreak', 'tasks', 'activeTimer', 'timerState'],
        (result) => {
          if (result.focusStreak) setFocusStreak(result.focusStreak);

          // Find active task - we use activeTimer regardless of whether timer is running
          if (result.activeTimer && result.tasks && result.tasks.inProgress) {
            const activeTaskData = result.tasks.inProgress.find(
              task => task.id === result.activeTimer
            );

            if (activeTaskData) {
              setActiveTask(activeTaskData);
            } else {
              // If there's an activeTimer but no matching task, clear it
              chrome.storage.local.remove(['activeTimer']);
              setActiveTask(null);
            }
          } else {
            setActiveTask(null);
          }

          if (result.timerState) {
            setTimerSettings(result.timerState);
          }
        }
      );
    };

    loadStorageData();

    // Listen for storage changes
    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        // If tasks or activeTimer changed, reload data
        if (changes.tasks || changes.activeTimer) {
          loadStorageData();
        }
        // If just timerState changed, only update timer settings
        else if (changes.timerState) {
          setTimerSettings(changes.timerState.newValue);
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Render active task card
  const renderActiveTaskCard = () => {
    if (!activeTask) return null;

    return (
      <div className="active-task-card">
        <div className="task-header">
          <h3>In Progress: {activeTask.title}</h3>
        </div>

        {activeTask.description && (
          <p className="task-description">{activeTask.description}</p>
        )}

        <span className={`priority ${activeTask.priority.toLowerCase()}`}>
          • {activeTask.priority}
        </span>

        <div className="task-timer">
          <div className="active-timer">
            <div className="timer-display">
              <PomodoroTimer activeTaskId={activeTask.id} />
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <h1>Welcome to LockIn</h1>
      <p className="quote">Time is a created thing. To say 'I don't have time' is to say 'I don't want to.'</p>

      <div className="dashboard-grid">
        {activeTask ? (
          <div className="current-task">
            <h2>Current Task</h2>
            {renderActiveTaskCard()}
          </div>
        ) : (
          <div className="quick-start">
            <h2>Quick Start</h2>
            <PomodoroTimer />
          </div>
        )}

        <div className="notification-filtering">
          <h2>Notification Filtering</h2>
          <NotificationFilter />
        </div>

        <div className="notifications-overview">
          <h2>Notifications Overview</h2>
          <NotificationsOverview />
        </div>

        <div className="productivity-analytics">
          <h2>Productivity Analytics</h2>
          <ProductivityAnalytics />
        </div>

        <div className="focus-streak">
          <h2>Focus Streak</h2>
          <FocusStreak data={focusStreak} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;