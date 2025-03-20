import React, { useState, useEffect } from 'react';

const NotificationFilter = () => {
  const [settings, setSettings] = useState({
    allowFrom: ['Gmail'],
    enableDuringBreaks: true
  });

  useEffect(() => {
    chrome.storage.local.get(['notificationSettings'], (result) => {
      if (result.notificationSettings) {
        setSettings(result.notificationSettings);
      }
    });
  }, []);

  const toggleSource = (source) => {
    const updatedSettings = { ...settings };
    const updatedSources = settings.allowFrom.includes(source)
      ? settings.allowFrom.filter(s => s !== source)
      : [...settings.allowFrom, source];

    updatedSettings.allowFrom = updatedSources;

    setSettings(updatedSettings);
    chrome.storage.local.set({
      notificationSettings: updatedSettings
    });
  };

  const toggleBreakNotifications = () => {
    const updatedSettings = {
      ...settings,
      enableDuringBreaks: !settings.enableDuringBreaks
    };

    setSettings(updatedSettings);
    chrome.storage.local.set({
      notificationSettings: updatedSettings
    });
  };

  return (
    <div className="notification-filter">
      <h3>Allow During Focus Sessions</h3>
      <div className="filter-options">
        <div className="filter-option">
          <input
            type="checkbox"
            id="gmail"
            checked={settings.allowFrom.includes('Gmail')}
            onChange={() => toggleSource('Gmail')}
          />
          <label htmlFor="gmail">Gmail</label>
        </div>
        <div className="filter-option">
          <input
            type="checkbox"
            id="calendar"
            checked={settings.allowFrom.includes('Calendar')}
            onChange={() => toggleSource('Calendar')}
          />
          <label htmlFor="calendar">Calendar</label>
        </div>
      </div>

      <div className="break-notifications">
        <h3>Break Settings</h3>
        <div className="filter-option">
          <input
            type="checkbox"
            id="enableDuringBreaks"
            checked={settings.enableDuringBreaks}
            onChange={toggleBreakNotifications}
          />
          <label htmlFor="enableDuringBreaks">Always allow notifications during breaks</label>
        </div>
      </div>
    </div>
  );
};

export default NotificationFilter;