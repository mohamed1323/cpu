import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ProcessTable from './components/ProcessTable';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsDisplay from './components/ResultsDisplay';
import CalculationButtons from './components/CalculationButtons';
import TestComponent from './components/TestComponent';

function App() {
  const [algorithm, setAlgorithm] = useState('fcfs');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [processes, setProcesses] = useState([]);
  const [processCounter, setProcessCounter] = useState(1);
  const [results, setResults] = useState({
    avgWaitingTime: '-',
    avgTurnaroundTime: '-'
  });

  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
    '#8F00FF', '#FF5733', '#00BCD4', '#FF9800', 
    '#795548', '#9C27B0', '#607D8B', '#E91E63'
  ];

  // Initialize with default processes
  useEffect(() => {
    const initialProcesses = [
      {
        id: 1,
        pid: 'P1',
        burstTime: 5,
        arrivalTime: 0,
        priority: 1,
        color: colors[0],
        waitingTime: '-',
        turnaroundTime: '-'
      },
      {
        id: 2,
        pid: 'P2',
        burstTime: 3,
        arrivalTime: 1,
        priority: 2,
        color: colors[1],
        waitingTime: '-',
        turnaroundTime: '-'
      },
      {
        id: 3,
        pid: 'P3',
        burstTime: 8,
        arrivalTime: 2,
        priority: 3,
        color: colors[2],
        waitingTime: '-',
        turnaroundTime: '-'
      }
    ];
    
    setProcesses(initialProcesses);
    setProcessCounter(4);
  }, []); // Empty dependency array to run only once

  const addNewProcess = (burstTime = '', arrivalTime = 0, priority = 1) => {
    const pid = 'P' + processCounter;
    const colorIndex = (processCounter - 1) % colors.length;
    const processColor = colors[colorIndex];

    const newProcess = {
      id: processCounter,
      pid,
      burstTime,
      arrivalTime,
      priority,
      color: processColor,
      waitingTime: '-',
      turnaroundTime: '-'
    };

    setProcesses(prev => [...prev, newProcess]);
    setProcessCounter(prev => prev + 1);
    resetCalculations();
  };

  const deleteProcess = (id) => {
    setProcesses(prev => prev.filter(process => process.id !== id));
    resetCalculations();
  };

  const updateProcess = (id, field, value) => {
    setProcesses(prev => prev.map(process => 
      process.id === id ? { ...process, [field]: value } : process
    ));
    resetCalculations();
  };

  const resetCalculations = () => {
    setProcesses(prev => prev.map(process => ({
      ...process,
      waitingTime: '-',
      turnaroundTime: '-'
    })));
    setResults({
      avgWaitingTime: '-',
      avgTurnaroundTime: '-'
    });
  };

  const getProcessesForCalculation = () => {
    return processes.map((process, index) => ({
      pid: process.pid,
      burstTime: parseInt(process.burstTime) || 0,
      arrivalTime: parseInt(process.arrivalTime) || 0,
      priority: parseInt(process.priority) || 1,
      color: process.color,
      remainingTime: parseInt(process.burstTime) || 0,
      waitingTime: 0,
      turnaroundTime: 0,
      completionTime: 0,
      index
    })).filter(process => process.burstTime > 0);
  };

  const calculateAndDisplayResults = () => {
    let processesForCalc = getProcessesForCalculation();
    
    if (processesForCalc.length === 0) return;

    // Sort and calculate based on algorithm
    switch (algorithm) {
      case 'fcfs':
        processesForCalc = fcfs(processesForCalc);
        break;
      case 'sjf':
        processesForCalc = sjf(processesForCalc);
        break;
      case 'priority':
        processesForCalc = priorityScheduling(processesForCalc);
        break;
      case 'rr':
        processesForCalc = roundRobin(processesForCalc, timeQuantum);
        break;
    }

    // Update UI with results
    updateProcessTable(processesForCalc);
    calculateAverageWaitingTime();
    calculateAverageTurnaroundTime();
  };

  const updateProcessTable = (calculatedProcesses) => {
    setProcesses(prev => prev.map(process => {
      const calculated = calculatedProcesses.find(p => p.pid === process.pid);
      return calculated ? {
        ...process,
        waitingTime: calculated.waitingTime,
        turnaroundTime: calculated.turnaroundTime
      } : process;
    }));
  };

  const calculateAverageWaitingTime = () => {
    const validProcesses = processes.filter(p => p.waitingTime !== '-');
    if (validProcesses.length === 0) return;

    const totalWaitingTime = validProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
    const average = (totalWaitingTime / validProcesses.length).toFixed(2);
    setResults(prev => ({ ...prev, avgWaitingTime: average }));
  };

  const calculateAverageTurnaroundTime = () => {
    const validProcesses = processes.filter(p => p.turnaroundTime !== '-');
    if (validProcesses.length === 0) return;

    const totalTurnaroundTime = validProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const average = (totalTurnaroundTime / validProcesses.length).toFixed(2);
    setResults(prev => ({ ...prev, avgTurnaroundTime: average }));
  };

  // CPU Scheduling Algorithms
  const fcfs = (processes) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;

    return sortedProcesses.map(process => {
      if (currentTime < process.arrivalTime) {
        currentTime = process.arrivalTime;
      }
      
      const waitingTime = currentTime - process.arrivalTime;
      const completionTime = currentTime + process.burstTime;
      const turnaroundTime = completionTime - process.arrivalTime;
      
      currentTime = completionTime;
      
      return {
        ...process,
        waitingTime,
        turnaroundTime,
        completionTime
      };
    });
  };

  const sjf = (processes) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const result = [];
    const remainingProcesses = [...sortedProcesses];

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (availableProcesses.length === 0) {
        currentTime = remainingProcesses[0].arrivalTime;
        continue;
      }

      const shortestJob = availableProcesses.reduce((shortest, current) => 
        current.burstTime < shortest.burstTime ? current : shortest
      );

      const waitingTime = currentTime - shortestJob.arrivalTime;
      const completionTime = currentTime + shortestJob.burstTime;
      const turnaroundTime = completionTime - shortestJob.arrivalTime;

      result.push({
        ...shortestJob,
        waitingTime,
        turnaroundTime,
        completionTime
      });

      currentTime = completionTime;
      remainingProcesses.splice(remainingProcesses.indexOf(shortestJob), 1);
    }

    return result;
  };

  const priorityScheduling = (processes) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const result = [];
    const remainingProcesses = [...sortedProcesses];

    while (remainingProcesses.length > 0) {
      const availableProcesses = remainingProcesses.filter(p => p.arrivalTime <= currentTime);
      
      if (availableProcesses.length === 0) {
        currentTime = remainingProcesses[0].arrivalTime;
        continue;
      }

      const highestPriority = availableProcesses.reduce((highest, current) => 
        current.priority < highest.priority ? current : highest
      );

      const waitingTime = currentTime - highestPriority.arrivalTime;
      const completionTime = currentTime + highestPriority.burstTime;
      const turnaroundTime = completionTime - highestPriority.arrivalTime;

      result.push({
        ...highestPriority,
        waitingTime,
        turnaroundTime,
        completionTime
      });

      currentTime = completionTime;
      remainingProcesses.splice(remainingProcesses.indexOf(highestPriority), 1);
    }

    return result;
  };

  const roundRobin = (processes, timeQuantum) => {
    const sortedProcesses = [...processes].sort((a, b) => a.arrivalTime - b.arrivalTime);
    let currentTime = 0;
    const result = [];
    const remainingProcesses = sortedProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));

    while (remainingProcesses.length > 0) {
      const currentProcess = remainingProcesses.shift();
      
      if (currentTime < currentProcess.arrivalTime) {
        currentTime = currentProcess.arrivalTime;
      }

      const executionTime = Math.min(timeQuantum, currentProcess.remainingTime);
      currentTime += executionTime;
      currentProcess.remainingTime -= executionTime;

      if (currentProcess.remainingTime === 0) {
        // Process completed
        const waitingTime = currentTime - currentProcess.burstTime - currentProcess.arrivalTime;
        const turnaroundTime = currentTime - currentProcess.arrivalTime;
        
        result.push({
          ...currentProcess,
          waitingTime,
          turnaroundTime,
          completionTime: currentTime
        });
      } else {
        // Process not completed, add back to queue
        remainingProcesses.push(currentProcess);
      }
    }

    return result;
  };

  const handleCalculateAll = () => {
    calculateAndDisplayResults();
  };

  const handleCalculateWaitingTime = () => {
    let processesForCalc = getProcessesForCalculation();
    
    if (processesForCalc.length === 0) return;

    switch (algorithm) {
      case 'fcfs':
        processesForCalc = fcfs(processesForCalc);
        break;
      case 'sjf':
        processesForCalc = sjf(processesForCalc);
        break;
      case 'priority':
        processesForCalc = priorityScheduling(processesForCalc);
        break;
      case 'rr':
        processesForCalc = roundRobin(processesForCalc, timeQuantum);
        break;
    }

    setProcesses(prev => prev.map(process => {
      const calculated = processesForCalc.find(p => p.pid === process.pid);
      return calculated ? {
        ...process,
        waitingTime: calculated.waitingTime
      } : process;
    }));
  };

  const handleCalculateTurnaroundTime = () => {
    let processesForCalc = getProcessesForCalculation();
    
    if (processesForCalc.length === 0) return;

    switch (algorithm) {
      case 'fcfs':
        processesForCalc = fcfs(processesForCalc);
        break;
      case 'sjf':
        processesForCalc = sjf(processesForCalc);
        break;
      case 'priority':
        processesForCalc = priorityScheduling(processesForCalc);
        break;
      case 'rr':
        processesForCalc = roundRobin(processesForCalc, timeQuantum);
        break;
    }

    setProcesses(prev => prev.map(process => {
      const calculated = processesForCalc.find(p => p.pid === process.pid);
      return calculated ? {
        ...process,
        turnaroundTime: calculated.turnaroundTime
      } : process;
    }));
  };

  return (
    <div className="container mt-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-4">CPU Scheduling Algorithm Simulator</h2>
          
          <AlgorithmSelector 
            algorithm={algorithm}
            setAlgorithm={setAlgorithm}
            timeQuantum={timeQuantum}
            setTimeQuantum={setTimeQuantum}
            resetCalculations={resetCalculations}
          />
          
          <h3 className="mt-4 mb-3">Process Table</h3>
          <div className="d-flex justify-content-end mb-3">
            <button 
              className="btn btn-primary"
              onClick={() => addNewProcess()}
            >
              Add Process
            </button>
          </div>
          
          <ProcessTable 
            processes={processes}
            algorithm={algorithm}
            onDelete={deleteProcess}
            onUpdate={updateProcess}
          />

          <TestComponent processes={processes} />

          <ResultsDisplay results={results} />
          
          <CalculationButtons 
            onCalculateAll={handleCalculateAll}
            onCalculateWaitingTime={handleCalculateWaitingTime}
            onCalculateTurnaroundTime={handleCalculateTurnaroundTime}
            onCalculateAvgWaitingTime={calculateAverageWaitingTime}
            onCalculateAvgTurnaroundTime={calculateAverageTurnaroundTime}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
