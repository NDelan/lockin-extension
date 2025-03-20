import React, { useEffect, useState } from 'react';

const NotificationsOverview = () => {
  const [notificationStats, setNotificationStats] = useState({
    gmail: 0,
    calendar: 0
  });
  const [hasNotifications, setHasNotifications] = useState(false);

  useEffect(() => {
    // Load notification stats from storage
    chrome.storage.local.get(['notificationStats'], (result) => {
      if (result.notificationStats) {
        setNotificationStats(result.notificationStats);
        setHasNotifications(
          result.notificationStats.gmail > 0 ||
          result.notificationStats.calendar > 0
        );
      } else {
        // Initialize empty stats if none exist
        chrome.storage.local.set({
          notificationStats: { gmail: 0, calendar: 0 }
        });
        setNotificationStats({ gmail: 0, calendar: 0 });
        setHasNotifications(false);
      }
    });
  }, []);
  
  // Listen for changes to notification stats
  useEffect(() => {
    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes.notificationStats) {
        const newStats = changes.notificationStats.newValue || { gmail: 0, calendar: 0 };
        setNotificationStats(newStats);
        setHasNotifications(newStats.gmail > 0 || newStats.calendar > 0);
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  const navigateToNotifications = () => {
    // Find the Notifications tab element and click it
    const notificationsTab = document.querySelector('.nav-item:nth-child(3)');
    if (notificationsTab) {
      notificationsTab.click();
    }
  };

  return (
    <div className="notifications-overview">
      {hasNotifications ? (
        <div className="notification-stats" onClick={navigateToNotifications} style={{ cursor: 'pointer' }}>
          {notificationStats.gmail > 0 && (
            <div className="notification-stat">
              <div className="source">Gmail</div>
              <div className="count">{notificationStats.gmail}</div>
            </div>
          )}
          {notificationStats.calendar > 0 && (
            <div className="notification-stat">
              <div className="source">Calendar</div>
              <div className="count">{notificationStats.calendar}</div>
            </div>
          )}
          <div className="notification-hint">Click to view details</div>
        </div>
      ) : (
        <div className="no-notifications">
          <p>No notifications received.</p>
          <p className="notification-hint">Notifications from Gmail and Calendar will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default NotificationsOverview;