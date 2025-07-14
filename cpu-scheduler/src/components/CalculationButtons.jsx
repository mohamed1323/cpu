import React from 'react';

const CalculationButtons = ({
  onCalculateAll,
  onCalculateWaitingTime,
  onCalculateTurnaroundTime,
  onCalculateAvgWaitingTime,
  onCalculateAvgTurnaroundTime
}) => {
  return (
    <div className="d-flex justify-content-center mt-4 gap-2 btn-group">
      <button 
        className="btn btn-success"
        onClick={onCalculateAll}
      >
        Calculate All
      </button>
      <button 
        className="btn btn-primary"
        onClick={onCalculateWaitingTime}
      >
        Calculate Waiting Time
      </button>
      <button 
        className="btn btn-primary"
        onClick={onCalculateTurnaroundTime}
      >
        Calculate Turnaround Time
      </button>
      <button 
        className="btn btn-primary"
        onClick={onCalculateAvgWaitingTime}
      >
        Calculate Avg Waiting Time
      </button>
      <button 
        className="btn btn-primary"
        onClick={onCalculateAvgTurnaroundTime}
      >
        Calculate Avg Turnaround Time
      </button>
    </div>
  );
};

export default CalculationButtons; 