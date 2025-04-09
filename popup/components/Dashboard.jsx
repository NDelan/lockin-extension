import React, { useState, useEffect } from 'react';
import PomodoroTimer from './PomodoroTimer';
import NotificationFilter from './NotificationFilter';
import NotificationsOverview from './NotificationsOverview';
import ProductivityAnalytics from './ProductivityAnalytics';
import FocusStreak from './FocusStreak';
import PopoutButton from './PopoutButton';

const Dashboard = () => {
  const [focusStreak, setFocusStreak] = useState({
    yesterday: 5,
    today: 3,
    weeklyGoal: 35
  });

  const [activeTask, setActiveTask] = useState(null);
  const [timerSettings, setTimerSettings] = useState(null);
  const [userName, setUserName] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isPopout, setIsPopout] = useState(false);

  // Check if in popout mode
  useEffect(() => {
    // Check URL for popout parameter
    const urlParams = new URLSearchParams(window.location.search);
    const popout = urlParams.get('popout');
    if (popout === 'true') {
      setIsPopout(true);
      // Add popout-mode class to body
      document.body.classList.add('popout-mode');
    }
  }, []);

  // Determine time of day for greeting
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    let greeting = '';
    if (hour < 12) {
      greeting = 'Good morning';
    } else if (hour < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }

    setTimeOfDay(greeting);

    // Try to get user name from storage
    chrome.storage.local.get(['userName'], (result) => {
      if (result.userName) {
        setUserName(result.userName);
      }
    });
  }, []);

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

  // Get motivational quotes
  const getRandomQuote = () => {
    const quotes = [
      "Time is a created thing. To say 'I don't have time' is to say 'I don't want to.'",
      "The key is not to prioritize what's on your schedule, but to schedule your priorities.",
      "Focus on being productive instead of busy.",
      "Your focus determines your reality.",
      "You will never find time for anything. If you want time, you must make it.",
      "The more time you spend on focused work, the more you separate yourself from the competition."
    ];

    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  // Render active task card with enhanced styling
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
      {/* Popout Button - only show if not already in popout mode */}
      {!isPopout && <PopoutButton />}

      <div className="dashboard-header">
        <div className="welcome-section">
          <h1>{timeOfDay}{userName ? `, ${userName}` : ''}</h1>
          <p className="quote">{getRandomQuote()}</p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Row 1: Timer and Notification Filtering */}
        <div className={activeTask ? "current-task" : "quick-start"}>
          <h2>
            <span className="icon">{activeTask ? '📋' : '⏱️'}</span>
            {activeTask ? 'Current Task' : 'Quick Start'}
          </h2>
          {renderActiveTaskCard() || <PomodoroTimer />}
        </div>

        <div className="notification-filtering">
          <h2>
            <span className="icon">🔔</span>
            Notification Filtering
          </h2>
          <NotificationFilter />
        </div>

        {/* Row 2: Notifications Overview */}
        <div className="notifications-overview">
          <h2>
            <span className="icon">📊</span>
            Notifications Overview
          </h2>
          <NotificationsOverview />
        </div>

        {/* Row 3: Productivity Analytics (full width) */}
        <div className="productivity-analytics">
          <h2>
            <span className="icon">📈</span>
            Productivity Analytics
          </h2>
          <ProductivityAnalytics />
        </div>

        {/* Row 4: Focus Streak (full width) */}
        <div className="focus-streak">
          <h2>
            <span className="icon">🔥</span>
            Focus Streak
          </h2>
          <FocusStreak data={focusStreak} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;