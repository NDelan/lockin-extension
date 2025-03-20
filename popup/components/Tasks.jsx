import React, { useState, useEffect, useRef } from 'react';
import PomodoroTimer from './PomodoroTimer';

const Tasks = () => {
  const [tasks, setTasks] = useState({
    inProgress: [],
    toDo: [],
    completed: [],
    backlog: []
  });

  const [activeTimer, setActiveTimer] = useState(null);
  const [timerSettings, setTimerSettings] = useState({
    minutes: 25,
    seconds: 0,
    isActive: false,
    timerType: 'POMODORO'
  });
  const [editingTask, setEditingTask] = useState(null);
  const dragItem = useRef(null);
  const dragOverItem = useRef(null);

  // Load tasks from storage
  useEffect(() => {
    // Load initial data
    const loadTaskData = () => {
      chrome.storage.local.get(['tasks', 'activeTimer', 'timerState'], (result) => {
        console.log('Loading task data:', result.tasks);
        if (result.tasks) {
          setTasks(result.tasks);
        }
        if (result.activeTimer) {
          setActiveTimer(result.activeTimer);
        }
        if (result.timerState) {
          setTimerSettings({
            minutes: result.timerState.savedMinutes || 25,
            seconds: result.timerState.savedSeconds || 0,
            isActive: result.timerState.savedIsActive || false,
            timerType: result.timerState.savedType || 'POMODORO'
          });
        }
      });
    };

    loadTaskData();

    // Add listener for storage changes
    const handleStorageChange = (changes, area) => {
      if (area === 'local') {
        if (changes.tasks) {
          // For the tasks object, don't use the newValue directly
          // Instead, reload everything from storage to ensure consistency
          loadTaskData();
        } else {
          // For other changes, update the specific values
          if (changes.activeTimer) {
            setActiveTimer(changes.activeTimer.newValue);
          }
          if (changes.timerState && changes.timerState.newValue) {
            setTimerSettings({
              minutes: changes.timerState.newValue.savedMinutes || 25,
              seconds: changes.timerState.newValue.savedSeconds || 0,
              isActive: changes.timerState.newValue.savedIsActive || false,
              timerType: changes.timerState.newValue.savedType || 'POMODORO'
            });
          }
        }
      }
    };

    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  // Save tasks to storage whenever they change
  useEffect(() => {
    // Only save if tasks have been initialized (not the empty initial state)
    if (Object.values(tasks).some(list => list.length > 0)) {
      console.log('Saving tasks:', tasks);
      chrome.storage.local.set({ tasks });
    }
  }, [tasks]);

  // Get initial duration based on timer type
  const getInitialDuration = (type) => {
    switch(type) {
      case 'SHORT_BREAK': return 5;
      case 'LONG_BREAK': return 15;
      case 'POMODORO':
      default: return 25;
    }
  };

  // Format time for display
  const formatTime = () => {
    return `${timerSettings.minutes < 10 ? '0' + timerSettings.minutes : timerSettings.minutes}:${timerSettings.seconds < 10 ? '0' + timerSettings.seconds : timerSettings.seconds}`;
  };

  // Add a new task to a column
  const addTask = (column) => {
    const newTask = {
      id: Date.now(),
      title: 'New Task',
      description: '',
      priority: 'Medium',
      createdAt: new Date().toISOString()
    };

    setTasks({
      ...tasks,
      [column]: [...tasks[column], newTask]
    });

    // Immediately set to editing mode for the new task
    setEditingTask({
      task: newTask,
      column
    });
  };

  // Update a task's properties
  const updateTask = (taskId, column, updates) => {
    const updatedTasks = {
      ...tasks,
      [column]: tasks[column].map(task =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    };

    setTasks(updatedTasks);
    setEditingTask(null);
  };

  // Delete a task
  const deleteTask = (taskId, column) => {
    setTasks({
      ...tasks,
      [column]: tasks[column].filter(task => task.id !== taskId)
    });

    if (activeTimer === taskId) {
      setActiveTimer(null);
      setTimerSettings(prev => ({
        ...prev,
        isActive: false
      }));
      chrome.storage.local.remove(['activeTimer']);
    }
  };

  // Clear all tasks from a column
  const clearColumn = (column) => {
    if (window.confirm(`Are you sure you want to clear all tasks from ${column}?`)) {
      // If there's an active timer for a task in this column, stop it
      if (activeTimer && tasks[column].some(task => task.id === activeTimer)) {
        setActiveTimer(null);
        setTimerSettings(prev => ({
          ...prev,
          isActive: false
        }));
        chrome.storage.local.remove(['activeTimer']);
      }

      setTasks({
        ...tasks,
        [column]: []
      });
    }
  };

  // Toggle Pomodoro timer for a task
//   const togglePomodoroForTask = (taskId) => {
//     chrome.storage.local.get(['timerState'], (result) => {
//       const currentTimerState = result.timerState || {};
//       const isCurrentlyActive = activeTimer === taskId && timerSettings.isActive;

//       // Set the new timer state
//       const newTimerState = {
//         savedType: timerSettings.timerType || 'POMODORO',
//         savedMinutes: isCurrentlyActive ? timerSettings.minutes : getInitialDuration(timerSettings.timerType || 'POMODORO'),
//         savedSeconds: isCurrentlyActive ? timerSettings.seconds : 0,
//         savedIsActive: !isCurrentlyActive,
//         startTime: !isCurrentlyActive ? Date.now() : null,
//         pausedAt: isCurrentlyActive ? Date.now() : null
//       };

//       // Update storage - this will trigger the listener in PomodoroTimer component
//       chrome.storage.local.set({
//         timerState: newTimerState,
//         activeTimer: !isCurrentlyActive ? taskId : null
//       });

//       // Update local state
//       setActiveTimer(!isCurrentlyActive ? taskId : null);
//       setTimerSettings({
//         ...timerSettings,
//         isActive: !isCurrentlyActive
//       });

//       // If this is a new active task, move it to inProgress
//       if (!isCurrentlyActive) {
//         const taskColumn = Object.keys(tasks).find(col =>
//           tasks[col].some(task => task.id === taskId)
//         );

//         if (taskColumn && taskColumn !== 'inProgress') {
//           moveTask(taskId, taskColumn, 'inProgress');
//         }
//       }

//       // Notify background script
//       chrome.runtime.sendMessage({
//         action: !isCurrentlyActive ? 'START_POMODORO' : 'PAUSE_POMODORO',
//         taskId
//       });
//     });
//   };

const togglePomodoroForTask = (taskId) => {
    chrome.storage.local.get(['timerState'], (result) => {
      const currentTimerState = result.timerState || {};
      const isCurrentlyActive = activeTimer === taskId && timerSettings.isActive;

      // Set the new timer state
      const newTimerState = {
        savedType: timerSettings.timerType || 'POMODORO',
        savedMinutes: isCurrentlyActive ? timerSettings.minutes : getInitialDuration(timerSettings.timerType || 'POMODORO'),
        savedSeconds: isCurrentlyActive ? timerSettings.seconds : 0,
        savedIsActive: !isCurrentlyActive,
        startTime: !isCurrentlyActive ? Date.now() : null,
        pausedAt: isCurrentlyActive ? Date.now() : null,
        taskId: taskId // Add task ID to timer state
      };

      // Update storage - this will trigger the listener in PomodoroTimer component
      // Important: Keep activeTimer value even when paused
      chrome.storage.local.set({
        timerState: newTimerState,
        activeTimer: taskId // Always keep the task ID in activeTimer
      });

      // Update local state
      setActiveTimer(taskId); // Always keep the active task reference
      setTimerSettings({
        ...timerSettings,
        isActive: !isCurrentlyActive
      });

      // If this is a new active task, move it to inProgress
      if (!isCurrentlyActive) {
        const taskColumn = Object.keys(tasks).find(col =>
          tasks[col].some(task => task.id === taskId)
        );

        if (taskColumn && taskColumn !== 'inProgress') {
          moveTask(taskId, taskColumn, 'inProgress');
        }
      }

      // Notify background script
      chrome.runtime.sendMessage({
        action: !isCurrentlyActive ? 'START_POMODORO' : 'PAUSE_POMODORO',
        taskId
      });
    });
  };

  // Handle drag start
  const handleDragStart = (e, id, column) => {
    dragItem.current = { id, column };
    // Set a simple data transfer to enable drag
    e.dataTransfer.setData('text', id);
  };

  // Handle drag over
  const handleDragOver = (e, column) => {
    e.preventDefault();
    dragOverItem.current = column;
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    const fromColumn = dragItem.current.column;
    const toColumn = dragOverItem.current;

    if (fromColumn && toColumn && fromColumn !== toColumn) {
      moveTask(dragItem.current.id, fromColumn, toColumn);
    }

    // Reset refs
    dragItem.current = null;
    dragOverItem.current = null;
  };

  // Move task between columns
  const moveTask = (taskId, fromColumn, toColumn) => {
    const taskIndex = tasks[fromColumn].findIndex(task => task.id === taskId);
    if (taskIndex === -1) return;

    const task = tasks[fromColumn][taskIndex];

    // Special handling for moving to inProgress
    if (toColumn === 'inProgress' && tasks.inProgress.length > 0) {
      // Optional: ask user if they want to replace current in-progress task
      if (!window.confirm('This will move your current in-progress task to the To Do list. Continue?')) {
        return;
      }

      // Move current in-progress tasks to To Do
      setTasks({
        ...tasks,
        inProgress: [task],
        toDo: [...tasks.toDo, ...tasks.inProgress],
        [fromColumn]: tasks[fromColumn].filter(t => t.id !== taskId)
      });
    } else {
      setTasks({
        ...tasks,
        [fromColumn]: tasks[fromColumn].filter(t => t.id !== taskId),
        [toColumn]: [...tasks[toColumn], task]
      });
    }
  };

  // Render task card based on state (viewing or editing)
  const renderTaskCard = (task, column) => {
    const isEditing = editingTask && editingTask.task.id === task.id && editingTask.column === column;
    const isActive = activeTimer === task.id;

    if (isEditing) {
      return (
        <div className="task-card editing" key={task.id}>
          <input
            type="text"
            className="edit-title"
            value={editingTask.task.title}
            onChange={(e) => setEditingTask({
              ...editingTask,
              task: { ...editingTask.task, title: e.target.value }
            })}
            autoFocus
          />

          <textarea
            className="edit-description"
            value={editingTask.task.description}
            placeholder="Add description..."
            onChange={(e) => setEditingTask({
              ...editingTask,
              task: { ...editingTask.task, description: e.target.value }
            })}
          />

          <select
            className="edit-priority"
            value={editingTask.task.priority}
            onChange={(e) => setEditingTask({
              ...editingTask,
              task: { ...editingTask.task, priority: e.target.value }
            })}
          >
            <option value="High">High priority</option>
            <option value="Medium">Medium priority</option>
            <option value="Low">Low priority</option>
          </select>

          <div className="edit-actions">
            <button
              className="save-button"
              onClick={() => updateTask(task.id, column, editingTask.task)}
            >
              Save
            </button>
            <button
              className="cancel-button"
              onClick={() => setEditingTask(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        className={`task-card ${isActive ? 'active' : ''}`}
        key={task.id}
        draggable
        onDragStart={(e) => handleDragStart(e, task.id, column)}
      >
        <div className="task-header">
          <h3>{task.title}</h3>
          <div className="task-actions">
            <button
              className="edit-task"
              onClick={() => setEditingTask({ task, column })}
            >
              ✏️
            </button>
            <button
              className="delete-task"
              onClick={() => deleteTask(task.id, column)}
            >
              🗑️
            </button>
          </div>
        </div>

        {task.description && (
          <p className="task-description">{task.description}</p>
        )}

        <span className={`priority ${task.priority.toLowerCase()}`}>
          • {task.priority}
        </span>

        {column === 'inProgress' && (
          <div className="task-timer">
            {isActive ? (
              <div className="active-timer">
                <PomodoroTimer activeTaskId={task.id} />
              </div>
            ) : (
              <button
                className="start-pomodoro"
                onClick={() => togglePomodoroForTask(task.id)}
              >
                Start Pomodoro
              </button>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="tasks-container">
      <div className="tasks-header">
        <h1>Task Management</h1>
        <button
          className="clear-all-button"
          onClick={() => {
            if (window.confirm('Are you sure you want to clear ALL tasks?')) {
              setTasks({
                inProgress: [],
                toDo: [],
                completed: [],
                backlog: []
              });
              setActiveTimer(null);
              setTimerSettings(prev => ({
                ...prev,
                isActive: false
              }));
              chrome.storage.local.remove(['activeTimer']);
            }
          }}
        >
          Clear All Tasks
        </button>
      </div>

      <div className="tasks-columns">
        <div
          className="task-column in-progress"
          onDragOver={(e) => handleDragOver(e, 'inProgress')}
          onDrop={handleDrop}
        >
          <div className="column-header">
            <h2>IN PROGRESS</h2>
            <button
              className="clear-column-button"
              onClick={() => clearColumn('inProgress')}
            >
              Clear
            </button>
          </div>
          {tasks.inProgress.map(task => renderTaskCard(task, 'inProgress'))}
        </div>

        <div
          className="task-column to-do"
          onDragOver={(e) => handleDragOver(e, 'toDo')}
          onDrop={handleDrop}
        >
          <div className="column-header">
            <h2>TO DO</h2>
            <button
              className="clear-column-button"
              onClick={() => clearColumn('toDo')}
            >
              Clear
            </button>
          </div>
          {tasks.toDo.map(task => renderTaskCard(task, 'toDo'))}
          <button className="add-task" onClick={() => addTask('toDo')}>
            Add task
          </button>
        </div>

        <div
          className="task-column completed"
          onDragOver={(e) => handleDragOver(e, 'completed')}
          onDrop={handleDrop}
        >
          <div className="column-header">
            <h2>COMPLETED</h2>
            <button
              className="clear-column-button"
              onClick={() => clearColumn('completed')}
            >
              Clear
            </button>
          </div>
          {tasks.completed.map(task => renderTaskCard(task, 'completed'))}
        </div>

        <div
          className="task-column backlog"
          onDragOver={(e) => handleDragOver(e, 'backlog')}
          onDrop={handleDrop}
        >
          <div className="column-header">
            <h2>BACKLOG</h2>
            <button
              className="clear-column-button"
              onClick={() => clearColumn('backlog')}
            >
              Clear
            </button>
          </div>
          {tasks.backlog.map(task => renderTaskCard(task, 'backlog'))}
          <button className="add-task" onClick={() => addTask('backlog')}>
            Add task
          </button>
        </div>
      </div>
    </div>
  );
};

export default Tasks;