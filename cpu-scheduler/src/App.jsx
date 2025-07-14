import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import ProcessTable from './components/ProcessTable';
import AlgorithmSelector from './components/AlgorithmSelector';
import ResultsDisplay from './components/ResultsDisplay';
import CalculationButtons from './components/CalculationButtons';

function App() {
  // State for selected algorithm
  const [algorithm, setAlgorithm] = useState('fcfs');
  // State for time quantum (used in Round Robin)
  const [timeQuantum, setTimeQuantum] = useState(2);
  // State for the list of processes
  const [processes, setProcesses] = useState([]);
  // State for the next process ID
  const [processCounter, setProcessCounter] = useState(1);
  // State for average results
  const [results, setResults] = useState({
    avgWaitingTime: '-',
    avgTurnaroundTime: '-'
  });

  // Color palette for process rows
  const colors = [
    '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
    '#8F00FF', '#FF5733', '#00BCD4', '#FF9800', 
    '#795548', '#9C27B0', '#607D8B', '#E91E63'
  ];
  // Ref for the hidden download link (CSV export)
  const downloadLinkRef = useRef(null);

  // Initialize with default processes on first render
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
  }, []); // Run only once

  // Add a new process to the table
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

  // Delete a process by ID
  const deleteProcess = (id) => {
    setProcesses(prev => prev.filter(process => process.id !== id));
    resetCalculations();
  };

  // Update a process field (burstTime, arrivalTime, priority)
  const updateProcess = (id, field, value) => {
    setProcesses(prev => prev.map(process => 
      process.id === id ? { ...process, [field]: value } : process
    ));
    resetCalculations();
  };

  // Reset waiting and turnaround times for all processes and averages
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

  // Prepare processes for calculation (parse numbers, filter out invalid)
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

  // Calculate and update all results for the selected algorithm
  const calculateAndDisplayResults = () => {
    let processesForCalc = getProcessesForCalculation();
    if (processesForCalc.length === 0) return;
    // Run the selected algorithm
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
    // Update process table and averages
    updateProcessTable(processesForCalc);
    calculateAverageWaitingTime();
    calculateAverageTurnaroundTime();
  };

  // Update process table with calculated waiting/turnaround times
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

  // Calculate average waiting time
  const calculateAverageWaitingTime = () => {
    const validProcesses = processes.filter(p => p.waitingTime !== '-');
    if (validProcesses.length === 0) return;
    const totalWaitingTime = validProcesses.reduce((sum, p) => sum + p.waitingTime, 0);
    const average = (totalWaitingTime / validProcesses.length).toFixed(2);
    setResults(prev => ({ ...prev, avgWaitingTime: average }));
  };

  // Calculate average turnaround time
  const calculateAverageTurnaroundTime = () => {
    const validProcesses = processes.filter(p => p.turnaroundTime !== '-');
    if (validProcesses.length === 0) return;
    const totalTurnaroundTime = validProcesses.reduce((sum, p) => sum + p.turnaroundTime, 0);
    const average = (totalTurnaroundTime / validProcesses.length).toFixed(2);
    setResults(prev => ({ ...prev, avgTurnaroundTime: average }));
  };

  // --- CPU Scheduling Algorithms ---

  // First-Come, First-Served (FCFS)
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

  // Shortest Job First (SJF)
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

  // Priority Scheduling
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

  // Round Robin
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

  // --- Calculation Button Handlers ---

  // Calculate all results
  const handleCalculateAll = () => {
    calculateAndDisplayResults();
  };

  // Calculate only waiting times
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

  // Calculate only turnaround times
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

  // --- Export/Import CSV ---

  // Export processes as CSV (include results and averages)
  const handleExportCSV = () => {
    if (processes.length === 0) return;
    const header = ['pid','burstTime','arrivalTime','priority','waitingTime','turnaroundTime'];
    const rows = processes.map(p => [
      p.pid,
      p.burstTime,
      p.arrivalTime,
      p.priority,
      p.waitingTime !== undefined ? p.waitingTime : '-',
      p.turnaroundTime !== undefined ? p.turnaroundTime : '-'
    ]);
    // Add averages row
    rows.push([
      'Average', '', '', '', results.avgWaitingTime, results.avgTurnaroundTime
    ]);
    const csvContent = [header, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    if (downloadLinkRef.current) {
      downloadLinkRef.current.href = url;
      downloadLinkRef.current.download = 'processes.csv';
      downloadLinkRef.current.click();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  };

  // Import processes from CSV
  const handleImportCSV = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.trim().split(/\r?\n/);
      if (lines.length < 2) return;
      const [header, ...dataRows] = lines;
      const columns = header.split(',');
      if (!['pid','burstTime','arrivalTime','priority'].every(col => columns.includes(col))) return;
      const newProcesses = dataRows.map((row, idx) => {
        const [pid, burstTime, arrivalTime, priority] = row.split(',');
        return {
          id: idx + 1,
          pid: pid || `P${idx+1}`,
          burstTime: Number(burstTime) || '',
          arrivalTime: Number(arrivalTime) || 0,
          priority: Number(priority) || 1,
          color: colors[idx % colors.length],
          waitingTime: '-',
          turnaroundTime: '-'
        };
      });
      setProcesses(newProcesses);
      setProcessCounter(newProcesses.length + 1);
      resetCalculations();
    };
    reader.readAsText(file);
    // Reset the input so the same file can be uploaded again if needed
    e.target.value = '';
  };

  return (
    <div className="container mt-5">
      <div className="card mb-4">
        <div className="card-body">
          <h2 className="mb-4">CPU Scheduling Algorithm Simulator</h2>

          {/* Export/Import CSV Controls */}
          <div className="d-flex gap-2 mb-3">
            <button className="btn btn-outline-secondary" onClick={handleExportCSV}>
              Export CSV
            </button>
            <a ref={downloadLinkRef} style={{ display: 'none' }}>Download</a>
            <label className="btn btn-outline-secondary mb-0">
              Import CSV
              <input type="file" accept=".csv" onChange={handleImportCSV} style={{ display: 'none' }} />
            </label>
          </div>
          
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
