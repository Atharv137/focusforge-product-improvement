import React from 'react';

export default function ProgressWidget({ tasks }) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.completed).length;
  const progressPercentage = totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100);

  return (
    <div className="progress-widget">
      <h3>Progress Tracker</h3>
      <div className="progress-stats">
        <p>Tasks Completed Today: {completedTasks} / {totalTasks}</p>
      </div>
      <div className="progress-bar-container">
        <div 
          className="progress-bar-fill" 
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      <p className="progress-percentage">{progressPercentage}%</p>
    </div>
  );
}
