import React from 'react';

const algoInfo = {
  fcfs: {
    name: 'First-Come, First-Served (FCFS)',
    formula: 'Waiting Time = Start Time - Arrival Time\nTurnaround Time = Completion Time - Arrival Time',
    explanation: 'FCFS schedules processes in the order they arrive. Each process waits until all previous processes have finished.'
  },
  sjf: {
    name: 'Shortest Job First (SJF)',
    formula: 'At each step, pick the available process with the shortest Burst Time.\nWaiting Time = Start Time - Arrival Time\nTurnaround Time = Completion Time - Arrival Time',
    explanation: 'SJF schedules the process with the shortest burst time among those that have arrived.'
  },
  priority: {
    name: 'Priority Scheduling',
    formula: 'At each step, pick the available process with the highest priority (lowest number).\nWaiting Time = Start Time - Arrival Time\nTurnaround Time = Completion Time - Arrival Time',
    explanation: 'Priority scheduling runs the process with the highest priority (lowest number) next.'
  },
  rr: {
    name: 'Round Robin (RR)',
    formula: 'Each process gets a fixed time quantum.\nIf not finished, it goes to the back of the queue.\nWaiting Time and Turnaround Time are calculated based on completion order.',
    explanation: 'Round Robin gives each process a time quantum and cycles through the ready queue.'
  }
};

function AlgorithmFormula({ algorithm }) {
  const info = algoInfo[algorithm] || {};
  return (
    <div className="card mb-3" style={{ background: '#fff', color: '#222' }}>
      <div className="card-body">
        <h5 className="card-title">{info.name || 'Algorithm'}</h5>
        {info.formula && <pre style={{ background: '#f8f9fa', padding: '0.75em', borderRadius: '6px' }}>{info.formula}</pre>}
        <p>{info.explanation}</p>
      </div>
    </div>
  );
}

export default AlgorithmFormula; 