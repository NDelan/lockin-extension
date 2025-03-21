import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ activeTaskId }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState('POMODORO');
  const [initialized, setInitialized] = useState(false);
  const [progress, setProgress] = useState(100); // For progress indicator

  // Get the initial duration based on timer type
  const getInitialDuration = (type) => {
    switch(type) {
      case 'SHORT_BREAK': return 5;
      case 'LONG_BREAK': return 15;
      case 'POMODORO': return 25;
      default: return 25;
    }
  };

  // Calculate total seconds for the timer
  const getTotalSeconds = (mins, secs) => {
    return mins * 60 + secs;
  };

  // Calculate the initial total seconds based on timer type
  const getInitialTotalSeconds = (type) => {
    return getInitialDuration(type) * 60;
  };

  // Load timer state from storage
  useEffect(() => {
    const loadTimerState = () => {
      chrome.storage.local.get(['timerState', 'activeTimer', 'settings'], (result) => {
        // Use settings if available
        const settings = result.settings || {};
        let initialPomodoro = settings.pomodoroMinutes || 25;
        let initialShortBreak = settings.shortBreakMinutes || 5;
        let initialLongBreak = settings.longBreakMinutes || 15;

        if (result.timerState) {
          // This instance of the timer should respond if:
          // 1. This is a dashboard timer with no associated task
          // 2. This is a task timer matching the active task
          const relevantToThisInstance =
            (!activeTaskId && !result.timerState.taskId) ||
            (activeTaskId && result.timerState.taskId === activeTaskId);

          if (!relevantToThisInstance) {
            // If not relevant to this timer, just set default values
            setMinutes(initialPomodoro);
            setSeconds(0);
            setIsActive(false);
            setTimerType('POMODORO');
            setProgress(100); // Reset progress
            setInitialized(true);
            return;
          }

          // Make sure to set timer type first before calculating minutes
          const savedType = result.timerState.savedType || 'POMODORO';
          setTimerType(savedType);

          // Get the appropriate initial duration for this timer type
          let initialDuration;
          switch(savedType) {
            case 'SHORT_BREAK': initialDuration = initialShortBreak; break;
            case 'LONG_BREAK': initialDuration = initialLongBreak; break;
            default: initialDuration = initialPomodoro;
          }

          // Calculate initial total seconds
          const initialTotalSeconds = initialDuration * 60;

          if (result.timerState.savedIsActive) {
            // If timer is active, calculate the current time based on endTime
            if (result.timerState.endTime) {
              const now = Date.now();
              const remainingMs = Math.max(0, result.timerState.endTime - now);

              if (remainingMs > 0) {
                const remainingMinutes = Math.floor(remainingMs / 60000);
                const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
                const currentTotalSeconds = getTotalSeconds(remainingMinutes, remainingSeconds);

                // Calculate progress percentage
                const progressPercentage = (currentTotalSeconds / initialTotalSeconds) * 100;

                setMinutes(remainingMinutes);
                setSeconds(remainingSeconds);
                setIsActive(true);
                setProgress(progressPercentage);
              } else {
                // Timer should have completed
                setMinutes(initialDuration);
                setSeconds(0);
                setIsActive(false);
                setProgress(100); // Reset progress

                // Since timer completed, update storage
                saveTimerState(false, initialDuration, 0, savedType);
              }
            } else {
              // No endTime but active - just use saved values
              const savedMinutes = result.timerState.savedMinutes || initialDuration;
              const savedSeconds = result.timerState.savedSeconds || 0;
              const currentTotalSeconds = getTotalSeconds(savedMinutes, savedSeconds);

              // Calculate progress percentage
              const progressPercentage = (currentTotalSeconds / initialTotalSeconds) * 100;

              setMinutes(savedMinutes);
              setSeconds(savedSeconds);
              setIsActive(true);
              setProgress(progressPercentage);
            }
          } else {
            // Timer is paused, use exact saved values
            const savedMinutes = result.timerState.savedMinutes || initialDuration;
            const savedSeconds = result.timerState.savedSeconds || 0;
            const currentTotalSeconds = getTotalSeconds(savedMinutes, savedSeconds);

            // Calculate progress percentage
            const progressPercentage = (currentTotalSeconds / initialTotalSeconds) * 100;

            setMinutes(savedMinutes);
            setSeconds(savedSeconds);
            setIsActive(false);
            setProgress(progressPercentage);
          }
        }
        setInitialized(true);
      });
    };

    loadTimerState();

    // Listen for storage changes
    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes.timerState) {
        loadTimerState();
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [activeTaskId]);

  // Timer countdown effect
  useEffect(() => {
    if (!initialized) return;

    let interval = null;

    if (isActive) {
      // When starting or resuming, immediately sync with storage
      // to ensure all timer instances start from the same point
      if (interval === null) {
        saveTimerState(true, minutes, seconds, timerType);
      }

      interval = setInterval(() => {
        chrome.storage.local.get(['timerState', 'settings'], (result) => {
          if (result.timerState && result.timerState.endTime) {
            // Always use the endTime from storage to calculate remaining time
            const now = Date.now();
            const remainingMs = Math.max(0, result.timerState.endTime - now);

            // Get the appropriate initial duration for this timer type
            const settings = result.settings || {};
            let initialDuration;
            switch(timerType) {
              case 'SHORT_BREAK': initialDuration = settings.shortBreakMinutes || 5; break;
              case 'LONG_BREAK': initialDuration = settings.longBreakMinutes || 15; break;
              default: initialDuration = settings.pomodoroMinutes || 25;
            }

            // Calculate initial total seconds
            const initialTotalSeconds = initialDuration * 60;

            if (remainingMs > 0) {
              const remainingMinutes = Math.floor(remainingMs / 60000);
              const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);
              const currentTotalSeconds = getTotalSeconds(remainingMinutes, remainingSeconds);

              // Calculate progress percentage
              const progressPercentage = (currentTotalSeconds / initialTotalSeconds) * 100;

              setMinutes(remainingMinutes);
              setSeconds(remainingSeconds);
              setProgress(progressPercentage);
            } else {
              // Timer completed
              clearInterval(interval);
              setIsActive(false);

              const newDuration = getInitialDuration(timerType);
              setMinutes(newDuration);
              setSeconds(0);
              setProgress(100); // Reset progress

              // Update storage
              saveTimerState(false, newDuration, 0, timerType);

              // Notify timer completion
              chrome.runtime.sendMessage({
                action: 'TIMER_COMPLETED',
                timerType,
                taskId: activeTaskId
              });
            }
          }
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, initialized, timerType]);

  // Save timer state to storage
  const saveTimerState = (isRunning, mins, secs, type = timerType) => {
    const now = Date.now();
    // Calculate endTime for active timers
    const totalMs = (mins * 60 + secs) * 1000;
    const endTime = isRunning ? now + totalMs : null;

    const timerState = {
      savedType: type,
      savedMinutes: mins,
      savedSeconds: secs,
      savedIsActive: isRunning,
      endTime: endTime,
      pausedAt: !isRunning ? now : null,
      taskId: activeTaskId || null // Keep track of which task this timer belongs to
    };

    // Important: Keep the activeTimer value even when paused
    chrome.storage.local.set({
      timerState,
      // Always maintain the activeTimer reference as long as we have a task
      activeTimer: activeTaskId || null
    });
  };

  const formatTime = () => {
    return `${minutes < 10 ? '0' + minutes : minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  };

  const toggleTimer = () => {
    const newActiveState = !isActive;
    setIsActive(newActiveState);

    // Save time state
    saveTimerState(newActiveState, minutes, seconds, timerType);

    // Notify background script
    chrome.runtime.sendMessage({
      action: newActiveState ? 'START_POMODORO' : 'PAUSE_POMODORO',
      timerType,
      taskId: activeTaskId
    });
  };

  const handleTimerTypeChange = (e) => {
    const newType = e.target.value;
    const newDuration = getInitialDuration(newType);

    // Update local state
    setTimerType(newType);
    setMinutes(newDuration);
    setSeconds(0);
    setIsActive(false);
    setProgress(100); // Reset progress

    // Update storage with the new timer type
    saveTimerState(false, newDuration, 0, newType);

    // Log for debugging
    console.log(`Timer type changed to: ${newType}, duration: ${newDuration} minutes`);
  };

  // Get background color based on timer type
  const getTimerTypeColor = () => {
    switch(timerType) {
      case 'SHORT_BREAK': return 'var(--accent-color)';
      case 'LONG_BREAK': return 'var(--primary-dark)';
      default: return 'var(--primary-color)';
    }
  };

  // Timer type display names
  const getTimerTypeDisplay = () => {
    switch(timerType) {
      case 'SHORT_BREAK': return 'Short Break';
      case 'LONG_BREAK': return 'Long Break';
      default: return 'Pomodoro';
    }
  };

  return (
    <div className="pomodoro-container">
      <div className="timer-type-selector">
        <select
          value={timerType}
          onChange={handleTimerTypeChange}
          style={{ borderColor: getTimerTypeColor() }}
        >
          <option value="POMODORO">POMODORO</option>
          <option value="SHORT_BREAK">SHORT BREAK</option>
          <option value="LONG_BREAK">LONG BREAK</option>
        </select>
      </div>

      <div className="timer-type-label" style={{ color: getTimerTypeColor() }}>
        {getTimerTypeDisplay()}
      </div>

      <div className="timer-display"
           style={{
             borderTop: `3px solid ${getTimerTypeColor()}`,
             position: 'relative',
             overflow: 'hidden'
           }}>
        {/* Progress bar */}
        <div
          className="timer-progress"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            height: '4px',
            width: `${progress}%`,
            background: `linear-gradient(to right, ${getTimerTypeColor()} 0%, ${getTimerTypeColor()}88 100%)`,
            transition: 'width 1s linear'
          }}
        ></div>
        {formatTime()}
      </div>

      <button
        className={`timer-button ${isActive ? 'pause' : 'start'}`}
        onClick={toggleTimer}
        style={{
          background: isActive ? 'var(--text-secondary)' : getTimerTypeColor()
        }}
      >
        {isActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

export default PomodoroTimer;