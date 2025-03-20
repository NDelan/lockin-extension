import React, { useState, useEffect } from 'react';

const PomodoroTimer = ({ activeTaskId }) => {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState('POMODORO');
  const [initialized, setInitialized] = useState(false);

  // Get the initial duration based on timer type
  const getInitialDuration = (type) => {
    switch(type) {
      case 'SHORT_BREAK': return 5;
      case 'LONG_BREAK': return 15;
      case 'POMODORO': return 25;
      default: return 25;
    }
  };

  // Load timer state from storage
  useEffect(() => {
    const loadTimerState = () => {
      chrome.storage.local.get(['timerState', 'activeTimer'], (result) => {
        if (result.timerState) {
          // This instance of the timer should respond if:
          // 1. This is a dashboard timer with no associated task
          // 2. This is a task timer matching the active task
          const relevantToThisInstance =
            (!activeTaskId && !result.timerState.taskId) ||
            (activeTaskId && result.timerState.taskId === activeTaskId);

          if (!relevantToThisInstance) {
            // If not relevant to this timer, just set default values
            setMinutes(getInitialDuration('POMODORO'));
            setSeconds(0);
            setIsActive(false);
            setTimerType('POMODORO');
            setInitialized(true);
            return;
          }

          // Make sure to set timer type first before calculating minutes
          const savedType = result.timerState.savedType || 'POMODORO';
          setTimerType(savedType);

          if (result.timerState.savedIsActive) {
            // If timer is active, calculate the current time based on endTime
            if (result.timerState.endTime) {
              const now = Date.now();
              const remainingMs = Math.max(0, result.timerState.endTime - now);

              if (remainingMs > 0) {
                const remainingMinutes = Math.floor(remainingMs / 60000);
                const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

                setMinutes(remainingMinutes);
                setSeconds(remainingSeconds);
                setIsActive(true);
              } else {
                // Timer should have completed
                const newDuration = getInitialDuration(savedType);
                setMinutes(newDuration);
                setSeconds(0);
                setIsActive(false);

                // Since timer completed, update storage
                saveTimerState(false, newDuration, 0, savedType);
              }
            } else {
              // No endTime but active - just use saved values
              setMinutes(result.timerState.savedMinutes || getInitialDuration(savedType));
              setSeconds(result.timerState.savedSeconds || 0);
              setIsActive(true);
            }
          } else {
            // Timer is paused, use exact saved values
            setMinutes(result.timerState.savedMinutes || getInitialDuration(savedType));
            setSeconds(result.timerState.savedSeconds || 0);
            setIsActive(false);
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
        chrome.storage.local.get(['timerState'], (result) => {
          if (result.timerState && result.timerState.endTime) {
            // Always use the endTime from storage to calculate remaining time
            const now = Date.now();
            const remainingMs = Math.max(0, result.timerState.endTime - now);

            if (remainingMs > 0) {
              const remainingMinutes = Math.floor(remainingMs / 60000);
              const remainingSeconds = Math.floor((remainingMs % 60000) / 1000);

              setMinutes(remainingMinutes);
              setSeconds(remainingSeconds);
            } else {
              // Timer completed
              clearInterval(interval);
              setIsActive(false);

              const newDuration = getInitialDuration(timerType);
              setMinutes(newDuration);
              setSeconds(0);

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

    // Update storage with the new timer type
    saveTimerState(false, newDuration, 0, newType);

    // Log for debugging
    console.log(`Timer type changed to: ${newType}, duration: ${newDuration} minutes`);
  };

  return (
    <div className="pomodoro-container">
      <div className="timer-type-selector">
        <select
          value={timerType}
          onChange={handleTimerTypeChange}
        >
          <option value="POMODORO">POMODORO</option>
          <option value="SHORT_BREAK">SHORT BREAK</option>
          <option value="LONG_BREAK">LONG BREAK</option>
        </select>
      </div>

      <div className="timer-display">
        {formatTime()}
      </div>

      <button
        className={`timer-button ${isActive ? 'pause' : 'start'}`}
        onClick={toggleTimer}
      >
        {isActive ? 'Pause' : 'Start'}
      </button>
    </div>
  );
};

export default PomodoroTimer;