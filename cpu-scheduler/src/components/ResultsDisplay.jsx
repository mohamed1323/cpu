import React from 'react';

const ResultsDisplay = ({ results }) => {
  return (
    <div className="row mt-4">
      <div className="col-md-6">
        <div className="card results-card">
          <div className="card-body">
            <h5 className="card-title">Average Waiting Time</h5>
            <p className="card-text">{results.avgWaitingTime}</p>
          </div>
        </div>
      </div>
      <div className="col-md-6">
        <div className="card results-card">
          <div className="card-body">
            <h5 className="card-title">Average Turnaround Time</h5>
            <p className="card-text">{results.avgTurnaroundTime}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsDisplay; 