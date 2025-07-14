import React from 'react';

const AlgorithmSelector = ({ 
  algorithm, 
  setAlgorithm, 
  timeQuantum, 
  setTimeQuantum, 
  resetCalculations 
}) => {
  const handleAlgorithmChange = (e) => {
    const newAlgorithm = e.target.value;
    setAlgorithm(newAlgorithm);
    resetCalculations();
  };

  const handleTimeQuantumChange = (e) => {
    setTimeQuantum(parseInt(e.target.value) || 2);
    resetCalculations();
  };

  return (
    <div className="algorithm-selector">
      <div className="mb-4">
        <label htmlFor="algorithm" className="form-label">Select Algorithm</label>
        <select 
          id="algorithm" 
          className="form-select"
          value={algorithm}
          onChange={handleAlgorithmChange}
        >
          <option value="fcfs">First-Come, First-Served (FCFS)</option>
          <option value="sjf">Shortest Job First (SJF)</option>
          <option value="priority">Priority Scheduling</option>
          <option value="rr">Round Robin</option>
        </select>
      </div>

      <div 
        id="timeQuantumContainer" 
        className={`mb-4 ${algorithm === 'rr' ? '' : 'd-none'}`}
      >
        <label htmlFor="timeQuantum" className="form-label">Time Quantum</label>
        <input 
          type="number" 
          id="timeQuantum" 
          className="form-control" 
          min="1" 
          value={timeQuantum}
          onChange={handleTimeQuantumChange}
        />
      </div>
    </div>
  );
};

export default AlgorithmSelector; 