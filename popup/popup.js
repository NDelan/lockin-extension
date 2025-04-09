import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import AdminDashboard from './components/AdminDashboard';
import './styles/main.css';
import './styles/admin-dashboard.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showAdminToggle, setShowAdminToggle] = useState(true); // Set to true for presentation
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
    } else {
      // Set minimum dimensions for the extension popup
      document.documentElement.style.minWidth = "400px";
      document.documentElement.style.minHeight = "500px";
    }
  }, []);

  // Load active tab and admin state from storage or set default
  useEffect(() => {
    chrome.storage.local.get(['activeTab', 'isAdminMode', 'adminAccess'], (result) => {
      if (result.activeTab) {
        setActiveTab(result.activeTab);
      }

      // Set admin mode from storage
      if (result.isAdminMode) {
        setIsAdminMode(result.isAdminMode);
      }

      // For production, you would check if admin access is enabled
      // For presentation purposes, we'll always show the toggle
      setShowAdminToggle(true);

      setInitialized(true);
    });
  }, []);

  // Save active tab to storage when changed
  useEffect(() => {
    if (initialized) {
      chrome.storage.local.set({ activeTab });
    }
  }, [activeTab, initialized]);

  // Save admin mode to storage when changed
  useEffect(() => {
    if (initialized) {
      chrome.storage.local.set({ isAdminMode });
    }
  }, [isAdminMode, initialized]);

  const renderContent = () => {
    // If in admin mode, show admin dashboard instead of regular dashboard
    if (isAdminMode && activeTab === 'dashboard') {
      return <AdminDashboard />;
    }

    switch(activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'tasks':
        return <Tasks />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  // Track analytics when tab changes
  const handleTabChange = (tab) => {
    setActiveTab(tab);

    // Example of tracking analytics
    if (typeof chrome.runtime !== 'undefined') {
      chrome.runtime.sendMessage({
        action: 'TRACK_EVENT',
        category: 'navigation',
        eventAction: 'change_tab',
        label: tab
      });
    }
  };

  // Toggle between user and admin views
  const toggleAdminMode = () => {
    setIsAdminMode(!isAdminMode);

    // Track view mode change
    if (typeof chrome.runtime !== 'undefined') {
      chrome.runtime.sendMessage({
        action: 'TRACK_EVENT',
        category: 'navigation',
        eventAction: 'toggle_admin_mode',
        label: !isAdminMode ? 'admin' : 'user'
      });
    }
  };

  return (
    <div className="extension-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">AZ</div>
          <h1>LockIn</h1>

          {/* Admin mode toggle switch */}
          {showAdminToggle && (
            <div className="admin-mode-toggle">
              <label className="toggle-switch" title={isAdminMode ? "Switch to User View" : "Switch to Admin View"}>
                <input
                  type="checkbox"
                  checked={isAdminMode}
                  onChange={toggleAdminMode}
                />
                <span className="toggle-slider">
                  <span className="toggle-icon">
                    {isAdminMode ? '👤' : '👥'}
                  </span>
                </span>
              </label>
            </div>
          )}
        </div>

        <nav>
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''} ${isAdminMode ? 'admin-active' : ''}`}
            onClick={() => handleTabChange('dashboard')}
          >
            <span className="nav-icon">{isAdminMode ? '📈' : '📊'}</span>
            {isAdminMode ? 'Analytics' : 'Dashboard'}
          </div>
          <div
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => handleTabChange('tasks')}
          >
            <span className="nav-icon">✓</span>
            My tasks
          </div>
          <div
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => handleTabChange('notifications')}
          >
            <span className="nav-icon">🔔</span>
            Notifications
          </div>
          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => handleTabChange('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </nav>

        <div className="nav-item" style={{marginTop: 'auto'}}>
          <span className="nav-icon">↪</span>
          Log out
        </div>

        {/* Admin mode indicator */}
        {isAdminMode && (
          <div className="admin-mode-indicator">
            Admin View
          </div>
        )}
      </div>
      <main>
        {renderContent()}
      </main>
    </div>
  );
};

// Use createRoot API for React 18+
import { createRoot } from 'react-dom/client';
const container = document.getElementById('app');
const root = createRoot(container);
root.render(<App />);