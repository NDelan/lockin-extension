import React, { useState, useEffect } from 'react';

const AdminDashboard = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [loading, setLoading] = useState(true);

  // Hardcoded data for visualization
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    // Simulate loading delay for presentation
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Demo data for visualizations
  const aggregateData = {
    // Daily data for charts
    dailyData: [
      {
        date: '2025-04-01',
        day: 'Tue',
        newUsers: 15,
        activeUsers: 18,
        focusTime: 85,
        tasks: 18,
        notifications: 54,
        retentionRate: 72
      },
      {
        date: '2025-04-02',
        day: 'Wed',
        newUsers: 12,
        activeUsers: 48,
        focusTime: 105,
        tasks: 22,
        notifications: 61,
        retentionRate: 75
      },
      {
        date: '2025-04-03',
        day: 'Thu',
        newUsers: 18,
        activeUsers: 45,
        focusTime: 95,
        tasks: 20,
        notifications: 58,
        retentionRate: 73
      },
      {
        date: '2025-04-04',
        day: 'Fri',
        newUsers: 22,
        activeUsers: 52,
        focusTime: 110,
        tasks: 25,
        notifications: 63,
        retentionRate: 78
      },
      {
        date: '2025-04-05',
        day: 'Sat',
        newUsers: 10,
        activeUsers: 30,
        focusTime: 65,
        tasks: 15,
        notifications: 40,
        retentionRate: 68
      },
      {
        date: '2025-04-06',
        day: 'Sun',
        newUsers: 8,
        activeUsers: 25,
        focusTime: 45,
        tasks: 12,
        notifications: 35,
        retentionRate: 65
      },
      {
        date: '2025-04-07',
        day: 'Mon',
        newUsers: 20,
        activeUsers: 50,
        focusTime: 105,
        tasks: 23,
        notifications: 60,
        retentionRate: 76
      }
    ],
    // Summary metrics
    totals: {
      users: 37,
      sessions: 25,
      focusTime: 610,
      tasks: 15,
      notifications: 71,
      retentionRate: 72
    },
    // Average metrics
    averages: {
      dailyActiveUsers: 18,
      focusTimePerUser: 58,
      tasksPerUser: 4.7,
      notificationsBlocked: 23
    },
    // Feature usage stats
    featureUsage: {
      dashboardViews: 37,
      taskCreation: 3,
      timerSessionStart: 1,
      timerSessionComplete: 1,
      taskComplete: 1
    },
    // Timer usage breakdown
    timerUsage: {
      dashboardTimer: 68,
      taskPageTimer: 32
    },
    // Notification settings
    notificationSettings: {
      blockDuringBreaks: 65,
      allowDuringBreaks: 35
    }
  };

  // A/B testing demo data - updated with new hypothesis
  const abTestData = {
    groupA: {
      users: 15,
      avgTaskMoveTime: 8.4, // seconds
      taskMovesPerSession: 6.3,
      errorRate: 12, // percentage
      satisfactionScore: 7.2,
      retentionRate: 64,
      tasksCompleted: 3.5
    },
    groupB: {
      users: 21,
      avgTaskMoveTime: 4.2, // seconds
      taskMovesPerSession: 8.9,
      errorRate: 5, // percentage
      satisfactionScore: 8.8,
      retentionRate: 79,
      tasksCompleted: 4.7
    },
    significance: {
      moveTime: 97,
      taskMoves: 95,
      errorRate: 96,
      satisfaction: 94,
      retention: 92,
      tasksCompleted: 90
    }
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  if (loading) {
    return <div className="admin-loading">Loading analytics data...</div>;
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p className="admin-description">
        Analytics and experiment data for the LockIn Chrome extension.
      </p>

      {/* Timeframe selector */}
      <div className="timeframe-selector">
        <button
          className={selectedTimeframe === 'week' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('week')}
        >
          Past Week
        </button>
        <button
          className={selectedTimeframe === 'month' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('month')}
        >
          Past Month
        </button>
        <button
          className={selectedTimeframe === 'quarter' ? 'active' : ''}
          onClick={() => setSelectedTimeframe('quarter')}
        >
          Past Quarter
        </button>
      </div>

      {/* Key metrics overview */}
      <div className="admin-section">
        <h2>Key Metrics Overview</h2>
        <div className="metrics-grid">
          <div className="metric-card">
            <h3>Total Users</h3>
            <div className="metric-value">{aggregateData.totals.users}</div>
            <div className="metric-description">
              New users during selected period
            </div>
          </div>

          <div className="metric-card">
            <h3>Active Sessions</h3>
            <div className="metric-value">{aggregateData.totals.sessions}</div>
            <div className="metric-description">
              Total Pomodoro sessions started
            </div>
          </div>

          <div className="metric-card">
            <h3>Avg. Daily Users</h3>
            <div className="metric-value">{aggregateData.averages.dailyActiveUsers}</div>
            <div className="metric-description">
              Users active per day
            </div>
          </div>

          <div className="metric-card">
            <h3>Retention Rate</h3>
            <div className="metric-value">{aggregateData.totals.retentionRate}%</div>
            <div className="metric-description">
              Users returning after first week
            </div>
          </div>
        </div>
      </div>

      {/* Feature Usage */}
      <div className="admin-section">
        <h2>Top Features</h2>
        <div className="feature-usage-grid">
          <div className="feature-usage-item">
            <span className="feature-label">Dashboard - view:</span>
            <span className="feature-value">{aggregateData.featureUsage.dashboardViews}</span>
          </div>
          <div className="feature-usage-item">
            <span className="feature-label">Task - create:</span>
            <span className="feature-value">{aggregateData.featureUsage.taskCreation}</span>
          </div>
          <div className="feature-usage-item">
            <span className="feature-label">Timer - session_start:</span>
            <span className="feature-value">{aggregateData.featureUsage.timerSessionStart}</span>
          </div>
          <div className="feature-usage-item">
            <span className="feature-label">Timer - complete:</span>
            <span className="feature-value">{aggregateData.featureUsage.timerSessionComplete}</span>
          </div>
          <div className="feature-usage-item">
            <span className="feature-label">Task - complete:</span>
            <span className="feature-value">{aggregateData.featureUsage.taskComplete}</span>
          </div>
        </div>

        {/* Timer Usage Breakdown */}
        <div className="feature-comparison">
          <h3>Timer Location Preference</h3>
          <div className="comparison-chart">
            <div className="comparison-item">
              <div className="comparison-bar dashboard-timer" style={{width: `${aggregateData.timerUsage.dashboardTimer}%`}}></div>
              <div className="comparison-label">Dashboard Timer: {aggregateData.timerUsage.dashboardTimer}%</div>
            </div>
            <div className="comparison-item">
              <div className="comparison-bar task-timer" style={{width: `${aggregateData.timerUsage.taskPageTimer}%`}}></div>
              <div className="comparison-label">Task Page Timer: {aggregateData.timerUsage.taskPageTimer}%</div>
            </div>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="feature-comparison">
          <h3>Notification Settings During Breaks</h3>
          <div className="comparison-chart">
            <div className="comparison-item">
              <div className="comparison-bar notifications-blocked" style={{width: `${aggregateData.notificationSettings.blockDuringBreaks}%`}}></div>
              <div className="comparison-label">Block Notifications: {aggregateData.notificationSettings.blockDuringBreaks}%</div>
            </div>
            <div className="comparison-item">
              <div className="comparison-bar notifications-allowed" style={{width: `${aggregateData.notificationSettings.allowDuringBreaks}%`}}></div>
              <div className="comparison-label">Allow Notifications: {aggregateData.notificationSettings.allowDuringBreaks}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* User growth chart */}
      <div className="admin-section">
        <h2>User Growth</h2>
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-bars">
              {aggregateData.dailyData.map((day, index) => (
                <div key={index} className="chart-bar-group">
                  <div
                    className="chart-bar new-users"
                    style={{height: `${day.newUsers * 3}px`}}
                    title={`New Users: ${day.newUsers}`}
                  ></div>
                  <div
                    className="chart-bar active-users"
                    style={{height: `${day.activeUsers * 1.5}px`}}
                    title={`Active Users: ${day.activeUsers}`}
                  ></div>
                  <div className="chart-label">{day.day}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color new-users"></div>
                <div>New Users</div>
              </div>
              <div className="legend-item">
                <div className="legend-color active-users"></div>
                <div>Active Users</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Productivity metrics */}
      <div className="admin-section">
        <h2>Productivity Metrics</h2>
        <div className="chart-container">
          <div className="chart-placeholder">
            <div className="chart-bars">
              {aggregateData.dailyData.map((day, index) => (
                <div key={index} className="chart-bar-group">
                  <div
                    className="chart-bar focus-time"
                    style={{height: `${day.focusTime * 0.7}px`}}
                    title={`Focus Time: ${day.focusTime} min`}
                  ></div>
                  <div
                    className="chart-bar tasks"
                    style={{height: `${day.tasks * 3}px`}}
                    title={`Tasks: ${day.tasks}`}
                  ></div>
                  <div className="chart-label">{day.day}</div>
                </div>
              ))}
            </div>
            <div className="chart-legend">
              <div className="legend-item">
                <div className="legend-color focus-time"></div>
                <div>Avg. Focus Time (min)</div>
              </div>
              <div className="legend-item">
                <div className="legend-color tasks"></div>
                <div>Tasks Completed</div>
              </div>
            </div>
          </div>
        </div>

        <div className="metrics-summary">
          <div className="summary-item">
            <span className="summary-label">Avg. Focus Time per User:</span>
            <span className="summary-value">{formatTime(aggregateData.averages.focusTimePerUser)}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Avg. Tasks per User:</span>
            <span className="summary-value">{aggregateData.averages.tasksPerUser}</span>
          </div>
          <div className="summary-item">
            <span className="summary-label">Notifications Blocked per Day:</span>
            <span className="summary-value">{aggregateData.averages.notificationsBlocked}</span>
          </div>
        </div>
      </div>

      {/* A/B Testing Results - Updated with new hypothesis */}
      <div className="admin-section">
        <h2>A/B Testing Experiment</h2>
        <div className="ab-test-description">
          <p>
            <strong>Hypothesis:</strong> Drag-and-drop task management (Group B) provides a more intuitive user experience than dropdown-based task movement (Group A), resulting in faster task transitions, higher task completion rates, and improved user satisfaction.
          </p>
          <p>
            <strong>Experiment Status:</strong> Running (Day 5 of 28)
          </p>
        </div>

        <div className="ab-test-results">
          <div className="test-group-comparison">
            <div className="test-group">
              <h3>Group A: Dropdown Selection</h3>
              <ul>
                <li>Users: {abTestData.groupA.users}</li>
                <li>Avg. Task Movement Time: {abTestData.groupA.avgTaskMoveTime.toFixed(1)} seconds</li>
                <li>Task Movements per Session: {abTestData.groupA.taskMovesPerSession}</li>
                <li>Error Rate: {abTestData.groupA.errorRate}%</li>
                <li>Satisfaction Score: {abTestData.groupA.satisfactionScore}/10</li>
                <li>Retention Rate: {abTestData.groupA.retentionRate}%</li>
                <li>Tasks Completed: {abTestData.groupA.tasksCompleted}/day</li>
              </ul>
            </div>

            <div className="test-group">
              <h3>Group B: Drag and Drop</h3>
              <ul>
                <li>Users: {abTestData.groupB.users}</li>
                <li>Avg. Task Movement Time: {abTestData.groupB.avgTaskMoveTime.toFixed(1)} seconds</li>
                <li>Task Movements per Session: {abTestData.groupB.taskMovesPerSession}</li>
                <li>Error Rate: {abTestData.groupB.errorRate}%</li>
                <li>Satisfaction Score: {abTestData.groupB.satisfactionScore}/10</li>
                <li>Retention Rate: {abTestData.groupB.retentionRate}%</li>
                <li>Tasks Completed: {abTestData.groupB.tasksCompleted}/day</li>
              </ul>
            </div>
          </div>

          {/* <h3>Preliminary Results</h3>
          <div className="ab-test-metrics">
            <table className="ab-test-table">
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Improvement</th>
                  <th>Statistical Significance</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Task Movement Time</td>
                  <td>-{Math.round((1 - abTestData.groupB.avgTaskMoveTime / abTestData.groupA.avgTaskMoveTime) * 100)}%</td>
                  <td>{abTestData.significance.moveTime}%</td>
                </tr>
                <tr>
                  <td>Task Movements per Session</td>
                  <td>+{Math.round((abTestData.groupB.taskMovesPerSession / abTestData.groupA.taskMovesPerSession - 1) * 100)}%</td>
                  <td>{abTestData.significance.taskMoves}%</td>
                </tr>
                <tr>
                  <td>Error Rate</td>
                  <td>-{Math.round((1 - abTestData.groupB.errorRate / abTestData.groupA.errorRate) * 100)}%</td>
                  <td>{abTestData.significance.errorRate}%</td>
                </tr>
                <tr>
                  <td>Satisfaction</td>
                  <td>+{Math.round((abTestData.groupB.satisfactionScore / abTestData.groupA.satisfactionScore - 1) * 100)}%</td>
                  <td>{abTestData.significance.satisfaction}%</td>
                </tr>
                <tr>
                  <td>Retention</td>
                  <td>+{Math.round((abTestData.groupB.retentionRate / abTestData.groupA.retentionRate - 1) * 100)}%</td>
                  <td>{abTestData.significance.retention}%</td>
                </tr>
                <tr>
                  <td>Tasks Completed</td>
                  <td>+{Math.round((abTestData.groupB.tasksCompleted / abTestData.groupA.tasksCompleted - 1) * 100)}%</td>
                  <td>{abTestData.significance.tasksCompleted}%</td>
                </tr>
              </tbody>
            </table>
          </div> */}

          {/* <div className="experiment-conclusion">
            <h3>Preliminary Conclusion</h3>
            <p>
              The drag-and-drop interface (Group B) demonstrates a {Math.round((1 - abTestData.groupB.avgTaskMoveTime / abTestData.groupA.avgTaskMoveTime) * 100)}% reduction in task movement time and a {Math.round((1 - abTestData.groupB.errorRate / abTestData.groupA.errorRate) * 100)}% lower error rate compared to the dropdown selection interface (Group A).
              Users in Group B also complete {Math.round((abTestData.groupB.taskMovesPerSession / abTestData.groupA.taskMovesPerSession - 1) * 100)}% more task movements per session, suggesting improved workflow efficiency.
            </p>
            <p>
              These results strongly indicate that the drag-and-drop interface provides a more intuitive and efficient task management experience, leading to higher user satisfaction and retention rates.
            </p>
          </div> */}
        </div>
      </div>

      {/* User Feedback Section */}
      <div className="admin-section">
        <h2>User Feedback</h2>
        <div className="user-feedback">
          <div className="feedback-card positive">
            <h3>Group B User</h3>
            <p className="feedback-text">
              "I love how I can just drag tasks between columns. It's so much more natural than using dropdowns, and I can see my entire workflow at once."
            </p>
            <div className="feedback-score">Rating: 9/10</div>
          </div>

          <div className="feedback-card neutral">
            <h3>Group A User</h3>
            <p className="feedback-text">
              "The dropdown selection works fine, but it takes a few clicks to move tasks around. Sometimes I forget which status I want to move tasks to."
            </p>
            <div className="feedback-score">Rating: 6/10</div>
          </div>

          <div className="feedback-card positive">
            <h3>Group B User</h3>
            <p className="feedback-text">
              "Dragging tasks directly into the Pomodoro section to start working on them feels incredibly intuitive. It's changed how I manage my workday."
            </p>
            <div className="feedback-score">Rating: 10/10</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;


// import React, { useState, useEffect } from 'react';

// const AdminDashboard = () => {
//   const [selectedTimeframe, setSelectedTimeframe] = useState('week');
//   const [loading, setLoading] = useState(true);

//   // Hardcoded data for visualization
//   const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

//   useEffect(() => {
//     // Simulate loading delay for presentation
//     const timer = setTimeout(() => {
//       setLoading(false);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, []);

//   // Demo data for visualizations
//   const aggregateData = {
//     // Daily data for charts
//     dailyData: [
//       {
//         date: '2025-04-01',
//         day: 'Tue',
//         newUsers: 15,
//         activeUsers: 42,
//         focusTime: 85,
//         tasks: 18,
//         notifications: 54,
//         retentionRate: 72
//       },
//       {
//         date: '2025-04-02',
//         day: 'Wed',
//         newUsers: 12,
//         activeUsers: 48,
//         focusTime: 105,
//         tasks: 22,
//         notifications: 61,
//         retentionRate: 75
//       },
//       {
//         date: '2025-04-03',
//         day: 'Thu',
//         newUsers: 18,
//         activeUsers: 45,
//         focusTime: 95,
//         tasks: 20,
//         notifications: 58,
//         retentionRate: 73
//       },
//       {
//         date: '2025-04-04',
//         day: 'Fri',
//         newUsers: 22,
//         activeUsers: 52,
//         focusTime: 110,
//         tasks: 25,
//         notifications: 63,
//         retentionRate: 78
//       },
//       {
//         date: '2025-04-05',
//         day: 'Sat',
//         newUsers: 10,
//         activeUsers: 30,
//         focusTime: 65,
//         tasks: 15,
//         notifications: 40,
//         retentionRate: 68
//       },
//       {
//         date: '2025-04-06',
//         day: 'Sun',
//         newUsers: 8,
//         activeUsers: 25,
//         focusTime: 45,
//         tasks: 12,
//         notifications: 35,
//         retentionRate: 65
//       },
//       {
//         date: '2025-04-07',
//         day: 'Mon',
//         newUsers: 20,
//         activeUsers: 50,
//         focusTime: 105,
//         tasks: 23,
//         notifications: 60,
//         retentionRate: 76
//       }
//     ],
//     // Summary metrics
//     totals: {
//       users: 105,
//       sessions: 290,
//       focusTime: 610,
//       tasks: 135,
//       notifications: 371,
//       retentionRate: 72
//     },
//     // Average metrics
//     averages: {
//       dailyActiveUsers: 42,
//       focusTimePerUser: 108,
//       tasksPerUser: 4.7,
//       notificationsBlocked: 53
//     }
//   };

//   // A/B testing demo data
//   const abTestData = {
//     groupA: {
//       users: 52,
//       avgFocusTime: 72,
//       completionRate: 68,
//       satisfactionScore: 7.2,
//       retentionRate: 64,
//       tasksPerDay: 3.5
//     },
//     groupB: {
//       users: 53,
//       avgFocusTime: 91,
//       completionRate: 85,
//       satisfactionScore: 8.9,
//       retentionRate: 78,
//       tasksPerDay: 4.8
//     },
//     significance: {
//       focusTime: 95,
//       completionRate: 99,
//       satisfaction: 98,
//       retention: 95,
//       tasks: 92
//     }
//   };

//   const formatTime = (minutes) => {
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;

//     if (hours > 0) {
//       return `${hours}h ${mins}m`;
//     }
//     return `${mins}m`;
//   };

//   if (loading) {
//     return <div className="admin-loading">Loading analytics data...</div>;
//   }

//   return (
//     <div className="admin-dashboard">
//       <h1>Admin Dashboard</h1>
//       <p className="admin-description">
//         Analytics and experiment data for the LockIn Chrome extension.
//       </p>

//       {/* Timeframe selector */}
//       <div className="timeframe-selector">
//         <button
//           className={selectedTimeframe === 'week' ? 'active' : ''}
//           onClick={() => setSelectedTimeframe('week')}
//         >
//           Past Week
//         </button>
//         <button
//           className={selectedTimeframe === 'month' ? 'active' : ''}
//           onClick={() => setSelectedTimeframe('month')}
//         >
//           Past Month
//         </button>
//         <button
//           className={selectedTimeframe === 'quarter' ? 'active' : ''}
//           onClick={() => setSelectedTimeframe('quarter')}
//         >
//           Past Quarter
//         </button>
//       </div>

//       {/* Key metrics overview */}
//       <div className="admin-section">
//         <h2>Key Metrics Overview</h2>
//         <div className="metrics-grid">
//           <div className="metric-card">
//             <h3>Total Users</h3>
//             <div className="metric-value">{aggregateData.totals.users}</div>
//             <div className="metric-description">
//               New users during selected period
//             </div>
//           </div>

//           <div className="metric-card">
//             <h3>Active Sessions</h3>
//             <div className="metric-value">{aggregateData.totals.sessions}</div>
//             <div className="metric-description">
//               Total Pomodoro sessions started
//             </div>
//           </div>

//           <div className="metric-card">
//             <h3>Avg. Daily Users</h3>
//             <div className="metric-value">{aggregateData.averages.dailyActiveUsers}</div>
//             <div className="metric-description">
//               Users active per day
//             </div>
//           </div>

//           <div className="metric-card">
//             <h3>Retention Rate</h3>
//             <div className="metric-value">{aggregateData.totals.retentionRate}%</div>
//             <div className="metric-description">
//               Users returning after first week
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* User growth chart */}
//       <div className="admin-section">
//         <h2>User Growth</h2>
//         <div className="chart-container">
//           <div className="chart-placeholder">
//             <div className="chart-bars">
//               {aggregateData.dailyData.map((day, index) => (
//                 <div key={index} className="chart-bar-group">
//                   <div
//                     className="chart-bar new-users"
//                     style={{height: `${day.newUsers * 3}px`}}
//                     title={`New Users: ${day.newUsers}`}
//                   ></div>
//                   <div
//                     className="chart-bar active-users"
//                     style={{height: `${day.activeUsers * 1.5}px`}}
//                     title={`Active Users: ${day.activeUsers}`}
//                   ></div>
//                   <div className="chart-label">{day.day}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="chart-legend">
//               <div className="legend-item">
//                 <div className="legend-color new-users"></div>
//                 <div>New Users</div>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-color active-users"></div>
//                 <div>Active Users</div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Productivity metrics */}
//       <div className="admin-section">
//         <h2>Productivity Metrics</h2>
//         <div className="chart-container">
//           <div className="chart-placeholder">
//             <div className="chart-bars">
//               {aggregateData.dailyData.map((day, index) => (
//                 <div key={index} className="chart-bar-group">
//                   <div
//                     className="chart-bar focus-time"
//                     style={{height: `${day.focusTime * 0.7}px`}}
//                     title={`Focus Time: ${day.focusTime} min`}
//                   ></div>
//                   <div
//                     className="chart-bar tasks"
//                     style={{height: `${day.tasks * 3}px`}}
//                     title={`Tasks: ${day.tasks}`}
//                   ></div>
//                   <div className="chart-label">{day.day}</div>
//                 </div>
//               ))}
//             </div>
//             <div className="chart-legend">
//               <div className="legend-item">
//                 <div className="legend-color focus-time"></div>
//                 <div>Avg. Focus Time (min)</div>
//               </div>
//               <div className="legend-item">
//                 <div className="legend-color tasks"></div>
//                 <div>Tasks Completed</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="metrics-summary">
//           <div className="summary-item">
//             <span className="summary-label">Avg. Focus Time per User:</span>
//             <span className="summary-value">{formatTime(aggregateData.averages.focusTimePerUser)}</span>
//           </div>
//           <div className="summary-item">
//             <span className="summary-label">Avg. Tasks per User:</span>
//             <span className="summary-value">{aggregateData.averages.tasksPerUser}</span>
//           </div>
//           <div className="summary-item">
//             <span className="summary-label">Notifications Blocked per Day:</span>
//             <span className="summary-value">{aggregateData.averages.notificationsBlocked}</span>
//           </div>
//         </div>
//       </div>

//       {/* A/B Testing Results */}
//       <div className="admin-section">
//         <h2>A/B Testing Experiment</h2>
//         <div className="ab-test-description">
//           <p>
//             <strong>Hypothesis:</strong> Smart notification batching (Group B) improves focus time and task completion compared to standard filtering (Group A).
//           </p>
//           <p>
//             <strong>Experiment Status:</strong> Running (Day 14 of 28)
//           </p>
//         </div>

//         <div className="ab-test-results">
//           <div className="test-group-comparison">
//             <div className="test-group">
//               <h3>Group A: Standard Filtering</h3>
//               <ul>
//                 <li>Users: {abTestData.groupA.users}</li>
//                 <li>Avg. Focus Time: {formatTime(abTestData.groupA.avgFocusTime)}/day</li>
//                 <li>Session Completion: {abTestData.groupA.completionRate}%</li>
//                 <li>Satisfaction Score: {abTestData.groupA.satisfactionScore}/10</li>
//                 <li>Retention Rate: {abTestData.groupA.retentionRate}%</li>
//                 <li>Tasks Completed: {abTestData.groupA.tasksPerDay}/day</li>
//               </ul>
//             </div>

//             <div className="test-group">
//               <h3>Group B: Smart Batching</h3>
//               <ul>
//                 <li>Users: {abTestData.groupB.users}</li>
//                 <li>Avg. Focus Time: {formatTime(abTestData.groupB.avgFocusTime)}/day</li>
//                 <li>Session Completion: {abTestData.groupB.completionRate}%</li>
//                 <li>Satisfaction Score: {abTestData.groupB.satisfactionScore}/10</li>
//                 <li>Retention Rate: {abTestData.groupB.retentionRate}%</li>
//                 <li>Tasks Completed: {abTestData.groupB.tasksPerDay}/day</li>
//               </ul>
//             </div>
//           </div>

//           <h3>Preliminary Results</h3>
//           <div className="ab-test-metrics">
//             <table className="ab-test-table">
//               <thead>
//                 <tr>
//                   <th>Metric</th>
//                   <th>Improvement</th>
//                   <th>Statistical Significance</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 <tr>
//                   <td>Focus Time</td>
//                   <td>+{Math.round((abTestData.groupB.avgFocusTime / abTestData.groupA.avgFocusTime - 1) * 100)}%</td>
//                   <td>{abTestData.significance.focusTime}%</td>
//                 </tr>
//                 <tr>
//                   <td>Completion Rate</td>
//                   <td>+{Math.round((abTestData.groupB.completionRate / abTestData.groupA.completionRate - 1) * 100)}%</td>
//                   <td>{abTestData.significance.completionRate}%</td>
//                 </tr>
//                 <tr>
//                   <td>Satisfaction</td>
//                   <td>+{Math.round((abTestData.groupB.satisfactionScore / abTestData.groupA.satisfactionScore - 1) * 100)}%</td>
//                   <td>{abTestData.significance.satisfaction}%</td>
//                 </tr>
//                 <tr>
//                   <td>Retention</td>
//                   <td>+{Math.round((abTestData.groupB.retentionRate / abTestData.groupA.retentionRate - 1) * 100)}%</td>
//                   <td>{abTestData.significance.retention}%</td>
//                 </tr>
//                 <tr>
//                   <td>Tasks Completed</td>
//                   <td>+{Math.round((parseFloat(abTestData.groupB.tasksPerDay) / parseFloat(abTestData.groupA.tasksPerDay) - 1) * 100)}%</td>
//                   <td>{abTestData.significance.tasks}%</td>
//                 </tr>
//               </tbody>
//             </table>
//           </div>

//           <div className="experiment-conclusion">
//             <h3>Preliminary Conclusion</h3>
//             <p>
//               Group B (Smart Notification Batching) is showing statistically significant improvements across all measured metrics.
//               Most notably, users in Group B exhibit a {Math.round((abTestData.groupB.completionRate / abTestData.groupA.completionRate - 1) * 100)}% higher focus session completion rate
//               and {Math.round((abTestData.groupB.retentionRate / abTestData.groupA.retentionRate - 1) * 100)}% higher retention rate.
//             </p>
//             <p>
//               If these trends continue for the remainder of the experiment, we should implement the smart batching approach for all users.
//             </p>
//           </div>
//         </div>
//       </div>

//       {/* User Feedback Section */}
//       <div className="admin-section">
//         <h2>User Feedback</h2>
//         <div className="user-feedback">
//           <div className="feedback-card positive">
//             <h3>Group B User</h3>
//             <p className="feedback-text">
//               "I love how notifications are grouped during breaks now. Makes it much easier to stay focused and still catch up on what I missed."
//             </p>
//             <div className="feedback-score">Rating: 9/10</div>
//           </div>

//           <div className="feedback-card neutral">
//             <h3>Group A User</h3>
//             <p className="feedback-text">
//               "The notification filtering works well, but sometimes I miss important messages until much later."
//             </p>
//             <div className="feedback-score">Rating: 7/10</div>
//           </div>

//           <div className="feedback-card positive">
//             <h3>Group B User</h3>
//             <p className="feedback-text">
//               "The batched notifications are a game-changer for my workflow. I'm completing more Pomodoro sessions than before."
//             </p>
//             <div className="feedback-score">Rating: 10/10</div>
//           </div>
//         </div>
//       </div>

//       {/* Next Steps Section */}
//       <div className="admin-section">
//         <h2>Next Steps</h2>
//         <div className="next-steps">
//           <div className="step-card">
//             <h3>Week 3-4</h3>
//             <ul>
//               <li>Continue monitoring experiment results</li>
//               <li>Collect additional user feedback through in-app surveys</li>
//               <li>Analyze potential edge cases in notification batching</li>
//             </ul>
//           </div>

//           <div className="step-card">
//             <h3>After Experiment</h3>
//             <ul>
//               <li>Implement winning variant for all users if results remain significant</li>
//               <li>Plan follow-up experiment for notification priority ranking</li>
//               <li>Document findings and prepare presentation for team review</li>
//             </ul>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default AdminDashboard;

