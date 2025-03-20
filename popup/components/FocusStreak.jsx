import React from 'react';

const FocusStreak = ({ data }) => {
  const { yesterday, today, weeklyGoal } = data;
  const progress = ((yesterday + today) / weeklyGoal) * 100;

  return (
    <div className="focus-streak-container">
      <div className="streak-stat">
        <div className="label">Yesterday</div>
        <div className="value">{yesterday} sessions</div>
      </div>

      <div className="streak-stat">
        <div className="label">Today</div>
        <div className="value">{today} sessions</div>
      </div>

      <div className="streak-stat">
        <div className="label">Weekly Goal</div>
        <div className="value">{weeklyGoal} sessions</div>
      </div>

      <div className="progress-bar-container">
        <div
          className="progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
    </div>
  );
};

export default FocusStreak;