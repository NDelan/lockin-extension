import React, { useState, useEffect } from 'react';

const Settings = () => {
  // Timer settings
  const [pomodoroMinutes, setPomodoroMinutes] = useState(25);
  const [shortBreakMinutes, setShortBreakMinutes] = useState(5);
  const [longBreakMinutes, setLongBreakMinutes] = useState(15);

  // Notification sounds
  const [notificationSound, setNotificationSound] = useState('bell');
  const [notificationVolume, setNotificationVolume] = useState(70);
  const [enableSounds, setEnableSounds] = useState(true);

  // Other settings
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartPomodoros, setAutoStartPomodoros] = useState(false);
  const [longBreakInterval, setLongBreakInterval] = useState(4);

  // Debug state to track loading
  const [isLoading, setIsLoading] = useState(true);

  // Load settings from storage on component mount
  useEffect(() => {
    console.log('Settings component mounted, loading data from storage');
    setIsLoading(true);

    try {
      chrome.storage.local.get(['settings'], (result) => {
        console.log('Settings retrieved from storage:', result);

        if (result.settings) {
          const settings = result.settings;
          // Timer durations
          setPomodoroMinutes(settings.pomodoroMinutes || 25);
          setShortBreakMinutes(settings.shortBreakMinutes || 5);
          setLongBreakMinutes(settings.longBreakMinutes || 15);

          // Sound settings
          setNotificationSound(settings.notificationSound || 'bell');
          setNotificationVolume(settings.notificationVolume || 70);
          setEnableSounds(settings.enableSounds !== false); // Default to true

          // Other settings
          setAutoStartBreaks(settings.autoStartBreaks !== false); // Default to true
          setAutoStartPomodoros(settings.autoStartPomodoros || false);
          setLongBreakInterval(settings.longBreakInterval || 4);
        } else {
          console.log('No settings found, using defaults');
        }
        setIsLoading(false);
      });
    } catch (error) {
      console.error('Error loading settings:', error);
      setIsLoading(false);
    }
  }, []);

  // Save settings to storage when any setting changes
  useEffect(() => {
    // Skip saving during initial load
    if (isLoading) return;

    console.log('Saving settings to storage');
    const settings = {
      pomodoroMinutes,
      shortBreakMinutes,
      longBreakMinutes,
      notificationSound,
      notificationVolume,
      enableSounds,
      autoStartBreaks,
      autoStartPomodoros,
      longBreakInterval
    };

    chrome.storage.local.set({ settings }, () => {
      console.log('Settings saved:', settings);
    });
  }, [
    isLoading,
    pomodoroMinutes,
    shortBreakMinutes,
    longBreakMinutes,
    notificationSound,
    notificationVolume,
    enableSounds,
    autoStartBreaks,
    autoStartPomodoros,
    longBreakInterval
  ]);

  // Available notification sounds
  const availableSounds = [
    { id: 'bell', name: 'Bell' },
    { id: 'digital', name: 'Digital' },
    { id: 'kitchen', name: 'Kitchen Timer' },
  ];

  // Reset to defaults
  const resetToDefaults = () => {
    setPomodoroMinutes(25);
    setShortBreakMinutes(5);
    setLongBreakMinutes(15);
    setNotificationSound('bell');
    setNotificationVolume(70);
    setEnableSounds(true);
    setAutoStartBreaks(true);
    setAutoStartPomodoros(false);
    setLongBreakInterval(4);
  };

  // Handle number input changes with validation
  const handleNumberChange = (setter, value, min, max) => {
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue >= min && numValue <= max) {
      setter(numValue);
    }
  };

  return (
    <div className="settings-page" style={{ marginLeft: '240px', padding: '20px' }}>
      <div className="settings-container">
        <h1>Settings</h1>

        <section className="settings-section">
          <h2>Timer Settings</h2>

          <div className="setting-item">
            <label htmlFor="pomodoro-length">Pomodoro Length (minutes)</label>
            <input
              id="pomodoro-length"
              type="number"
              min="1"
              max="120"
              value={pomodoroMinutes}
              onChange={(e) => handleNumberChange(setPomodoroMinutes, e.target.value, 1, 120)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="short-break-length">Short Break Length (minutes)</label>
            <input
              id="short-break-length"
              type="number"
              min="1"
              max="30"
              value={shortBreakMinutes}
              onChange={(e) => handleNumberChange(setShortBreakMinutes, e.target.value, 1, 30)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="long-break-length">Long Break Length (minutes)</label>
            <input
              id="long-break-length"
              type="number"
              min="1"
              max="60"
              value={longBreakMinutes}
              onChange={(e) => handleNumberChange(setLongBreakMinutes, e.target.value, 1, 60)}
            />
          </div>

          <div className="setting-item">
            <label htmlFor="long-break-interval">Long Break After (pomodoros)</label>
            <input
              id="long-break-interval"
              type="number"
              min="2"
              max="10"
              value={longBreakInterval}
              onChange={(e) => handleNumberChange(setLongBreakInterval, e.target.value, 2, 10)}
            />
          </div>
        </section>

        <section className="settings-section">
          <h2>Notification Sounds</h2>

          <div className="setting-item switch">
            <label htmlFor="enable-sounds">
              Enable Sounds
              <input
                id="enable-sounds"
                type="checkbox"
                checked={enableSounds}
                onChange={() => setEnableSounds(!enableSounds)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item">
            <label htmlFor="notification-sound">Notification Sound</label>
            <select
              id="notification-sound"
              value={notificationSound}
              onChange={(e) => setNotificationSound(e.target.value)}
              disabled={!enableSounds}
            >
              {availableSounds.map(sound => (
                <option key={sound.id} value={sound.id}>{sound.name}</option>
              ))}
            </select>
            <button
              className="test-sound-btn"
              onClick={() => {
                if (enableSounds) {
                  // Play the selected sound
                  const audio = new Audio(`/assets/sounds/${notificationSound}.mp3`);
                  audio.volume = notificationVolume / 100;
                  audio.play();
                }
              }}
              disabled={!enableSounds}
            >
              Test
            </button>
          </div>

          <div className="setting-item">
            <label htmlFor="volume-slider">Volume</label>
            <input
              id="volume-slider"
              type="range"
              min="0"
              max="100"
              value={notificationVolume}
              onChange={(e) => setNotificationVolume(parseInt(e.target.value, 10))}
              disabled={!enableSounds}
            />
            <span>{notificationVolume}%</span>
          </div>
        </section>

        <section className="settings-section">
          <h2>Auto Start Options</h2>

          <div className="setting-item switch">
            <label htmlFor="auto-start-breaks">
              Auto-start Breaks
              <input
                id="auto-start-breaks"
                type="checkbox"
                checked={autoStartBreaks}
                onChange={() => setAutoStartBreaks(!autoStartBreaks)}
              />
              <span className="slider"></span>
            </label>
          </div>

          <div className="setting-item switch">
            <label htmlFor="auto-start-pomodoros">
              Auto-start Pomodoros
              <input
                id="auto-start-pomodoros"
                type="checkbox"
                checked={autoStartPomodoros}
                onChange={() => setAutoStartPomodoros(!autoStartPomodoros)}
              />
              <span className="slider"></span>
            </label>
          </div>
        </section>

        <div className="settings-actions">
          <button className="reset-button" onClick={resetToDefaults}>
            Reset to Defaults
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;