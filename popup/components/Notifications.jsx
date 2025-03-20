import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filteredNotifications, setFilteredNotifications] = useState([]);
  const [settings, setSettings] = useState({
    allowFrom: ['Gmail'],
    enableDuringBreaks: true
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');

  // Load notifications from storage
  useEffect(() => {
    chrome.storage.local.get(['notifications', 'notificationSettings'], (result) => {
      if (result.notifications) {
        // Filter to only show Gmail and Calendar notifications
        const relevantNotifications = result.notifications.filter(
          notification => notification.source === 'Gmail' || notification.source === 'Calendar'
        );
        setNotifications(relevantNotifications);
        setFilteredNotifications(relevantNotifications);
      }
      if (result.notificationSettings) {
        setSettings(result.notificationSettings);
      }
    });
  }, []);

  // Handle search and filtering
  useEffect(() => {
    let filtered = [...notifications];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(notification =>
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.source.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply source filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(notification =>
        notification.source.toLowerCase() === activeFilter.toLowerCase()
      );
    }

    setFilteredNotifications(filtered);
  }, [searchTerm, activeFilter, notifications]);

  const deleteNotification = (id) => {
    const updatedNotifications = notifications.filter(notification => notification.id !== id);
    setNotifications(updatedNotifications);

    // Also update in storage
    chrome.storage.local.get(['notifications', 'notificationStats'], (result) => {
      const allNotifications = result.notifications || [];
      const filtered = allNotifications.filter(notification => notification.id !== id);

      // Update notification stats
      const stats = { gmail: 0, calendar: 0 };
      filtered.forEach(notification => {
        if (notification.source === 'Gmail') stats.gmail++;
        if (notification.source === 'Calendar') stats.calendar++;
      });

      chrome.storage.local.set({
        notifications: filtered,
        notificationStats: stats
      });
    });
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setFilteredNotifications([]);

    // Clear notifications in storage and reset stats
    chrome.storage.local.set({
      notifications: [],
      notificationStats: { gmail: 0, calendar: 0 }
    });

    // Also send a message to background script
    chrome.runtime.sendMessage({ action: 'CLEAR_NOTIFICATIONS' });
  };

  const toggleNotificationSource = (source) => {
    const updatedSettings = { ...settings };
    if (updatedSettings.allowFrom.includes(source)) {
      updatedSettings.allowFrom = updatedSettings.allowFrom.filter(s => s !== source);
    } else {
      updatedSettings.allowFrom.push(source);
    }
    setSettings(updatedSettings);
    chrome.storage.local.set({ notificationSettings: updatedSettings });
  };

  const toggleBreakNotifications = () => {
    const updatedSettings = {
      ...settings,
      enableDuringBreaks: !settings.enableDuringBreaks
    };
    setSettings(updatedSettings);
    chrome.storage.local.set({ notificationSettings: updatedSettings });
  };

  // Group notifications by source
  const groupedNotifications = filteredNotifications.reduce((groups, notification) => {
    const source = notification.source;
    if (!groups[source]) {
      groups[source] = [];
    }
    groups[source].push(notification);
    return groups;
  }, {});

  // Check if we have any notifications to display
  const hasNotifications = filteredNotifications.length > 0;

  return (
    <div className="notifications-container">
      <div className="notifications-header">
        <input
          type="text"
          placeholder="Search notifications"
          className="search-notifications"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <div className="filter-dropdown">
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="source-filter"
          >
            <option value="all">All Sources</option>
            <option value="gmail">Gmail</option>
            <option value="calendar">Calendar</option>
          </select>
        </div>
      </div>

      <div className="notifications-content">
        <div className="notifications-list">
          <div className="notifications-list-header">
            <h2>Recent notifications</h2>
            <button
              onClick={clearAllNotifications}
              className="reset-notifications"
              title="Clear all notifications"
            >
              Clear All
            </button>
          </div>

          {hasNotifications ? (
            Object.keys(groupedNotifications).map(source => (
              <div className="notification-group" key={source}>
                <h3 className="notification-group-header">{source}</h3>
                {groupedNotifications[source].map(notification => (
                  <div className="notification-item" key={notification.id}>
                    <div className="notification-content">
                      <p>{notification.message}</p>
                      <span className="notification-time">
                        {new Date(notification.time).toLocaleString()}
                      </span>
                    </div>
                    <button
                      className="delete-notification"
                      onClick={() => deleteNotification(notification.id)}
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="no-notifications-message">
              <p>No notifications to display.</p>
              {searchTerm || activeFilter !== 'all' ? (
                <p>Try adjusting your search or filter settings.</p>
              ) : null}
            </div>
          )}
        </div>

        <div className="notification-settings">
          <h2>Notification Settings</h2>

          <div className="notification-setting-group">
            <h3>Allow During Focus Sessions</h3>
            <div className="notification-setting">
              <div className="setting-label">Gmail</div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.allowFrom.includes('Gmail')}
                    onChange={() => toggleNotificationSource('Gmail')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>

            <div className="notification-setting">
              <div className="setting-label">Calendar</div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.allowFrom.includes('Calendar')}
                    onChange={() => toggleNotificationSource('Calendar')}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>

          <div className="notification-setting-group">
            <h3>Break Settings</h3>
            <div className="notification-setting">
              <div className="setting-label">Allow notifications during breaks</div>
              <div className="setting-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={settings.enableDuringBreaks}
                    onChange={toggleBreakNotifications}
                  />
                  <span className="slider round"></span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;