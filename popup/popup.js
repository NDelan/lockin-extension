import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import Dashboard from './components/Dashboard';
import Tasks from './components/Tasks';
import Notifications from './components/Notifications';
import Settings from './components/Settings';
import './styles/main.css';

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [initialized, setInitialized] = useState(false);

  // Load active tab from storage or set default
  useEffect(() => {
    chrome.storage.local.get(['activeTab'], (result) => {
      if (result.activeTab) {
        setActiveTab(result.activeTab);
      }
      setInitialized(true);
    });
  }, []);

  // Save active tab to storage when changed
  useEffect(() => {
    if (initialized) {
      chrome.storage.local.set({ activeTab });
    }
  }, [activeTab, initialized]);

  const renderContent = () => {
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

  return (
    <div className="extension-container">
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="logo">AZ</div>
          <h1>LockIn</h1>
        </div>

        <nav>
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </div>

          <div
            className={`nav-item ${activeTab === 'tasks' ? 'active' : ''}`}
            onClick={() => setActiveTab('tasks')}
          >
            <span className="nav-icon">✓</span>
            My tasks
          </div>

          <div
            className={`nav-item ${activeTab === 'notifications' ? 'active' : ''}`}
            onClick={() => setActiveTab('notifications')}
          >
            <span className="nav-icon">🔔</span>
            Notifications
          </div>

          <div
            className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="nav-icon">⚙️</span>
            Settings
          </div>
        </nav>

        <div className="nav-item" style={{marginTop: 'auto'}}>
          <span className="nav-icon">↪</span>
          Log out
        </div>
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