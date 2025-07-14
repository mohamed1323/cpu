document.addEventListener('DOMContentLoaded', function() {
    // UI Elements
    const algorithmSelect = document.getElementById('algorithm');
    const timeQuantumContainer = document.getElementById('timeQuantumContainer');
    const timeQuantumInput = document.getElementById('timeQuantum');
    const addProcessBtn = document.getElementById('addProcess');
    const processTableBody = document.getElementById('processTableBody');
    const avgWaitingTimeElement = document.getElementById('avgWaitingTime');
    const avgTurnaroundTimeElement = document.getElementById('avgTurnaroundTime');
    
    // Calculation buttons
    const calculateAllBtn = document.getElementById('calculateAll');
    const calculateWaitingTimeBtn = document.getElementById('calculateWaitingTime');
    const calculateTurnaroundTimeBtn = document.getElementById('calculateTurnaroundTime');
    const calculateAvgWaitingTimeBtn = document.getElementById('calculateAvgWaitingTime');
    const calculateAvgTurnaroundTimeBtn = document.getElementById('calculateAvgTurnaroundTime');
    
    // Process counter
    let processCounter = 1;
    const colors = [
        '#4285F4', '#EA4335', '#FBBC05', '#34A853', 
        '#8F00FF', '#FF5733', '#00BCD4', '#FF9800', 
        '#795548', '#9C27B0', '#607D8B', '#E91E63'
    ];

    // Event Listeners
    algorithmSelect.addEventListener('change', function() {
        const priorityColumn = document.querySelector('.priority-column');
        
        // Show/hide priority column based on algorithm
        if (this.value === 'priority') {
            priorityColumn.classList.remove('d-none');
            document.querySelectorAll('.priority-cell').forEach(cell => {
                cell.classList.remove('d-none');
            });
        } else {
            priorityColumn.classList.add('d-none');
            document.querySelectorAll('.priority-cell').forEach(cell => {
                cell.classList.add('d-none');
            });
        }
        
        // Show/hide time quantum input for Round Robin
        if (this.value === 'rr') {
            timeQuantumContainer.classList.remove('d-none');
        } else {
            timeQuantumContainer.classList.add('d-none');
        }
        
        // Reset calculation results when algorithm changes
        resetCalculations();
    });
    
    // Add process button
    addProcessBtn.addEventListener('click', function() {
        addNewProcess();
    });
    
    // Add initial processes (P1, P2, P3)
    addNewProcess(5);
    addNewProcess(3);
    addNewProcess(8);
    
    // Calculate buttons
    calculateAllBtn.addEventListener('click', function() {
        const algorithm = algorithmSelect.value;
        calculateAndDisplayResults(algorithm);
    });
    
    calculateWaitingTimeBtn.addEventListener('click', function() {
        const algorithm = algorithmSelect.value;
        calculateWaitingTimes(algorithm);
    });
    
    calculateTurnaroundTimeBtn.addEventListener('click', function() {
        const algorithm = algorithmSelect.value;
        calculateTurnaroundTimes(algorithm);
    });
    
    calculateAvgWaitingTimeBtn.addEventListener('click', function() {
        calculateAverageWaitingTime();
    });
    
    calculateAvgTurnaroundTimeBtn.addEventListener('click', function() {
        calculateAverageTurnaroundTime();
    });
    
    // Functions
    function addNewProcess(burstTime = '', arrivalTime = 0, priority = 1) {
        const pid = 'P' + processCounter;
        const row = document.createElement('tr');
        
        const colorIndex = (processCounter - 1) % colors.length;
        const processColor = colors[colorIndex];
        
        row.innerHTML = `
            <td class="text-center">${pid}</td>
            <td>
                <input type="number" class="form-control burst-time" min="1" value="${burstTime}">
            </td>
            <td>
                <input type="number" class="form-control arrival-time" min="0" value="${arrivalTime}">
            </td>
            <td class="priority-cell ${algorithmSelect.value !== 'priority' ? 'd-none' : ''}">
                <input type="number" class="form-control priority" min="1" value="${priority}">
            </td>
            <td class="waiting-time text-center">-</td>
            <td class="turnaround-time text-center">-</td>
            <td class="text-center">
                <button class="btn btn-danger delete-process">Delete</button>
            </td>
        `;
        
        // Set a data attribute for the process color
        row.dataset.color = processColor;
        
        // Add event listener for delete button
        row.querySelector('.delete-process').addEventListener('click', function() {
            row.remove();
            resetCalculations();
        });
        
        // Add event listeners for input changes
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', resetCalculations);
        });
        
        processTableBody.appendChild(row);
        processCounter++;
    }
    
    function resetCalculations() {
        // Reset waiting and turnaround times
        document.querySelectorAll('.waiting-time').forEach(cell => {
            cell.textContent = '-';
        });
        
        document.querySelectorAll('.turnaround-time').forEach(cell => {
            cell.textContent = '-';
        });
        
        // Reset averages
        avgWaitingTimeElement.textContent = '-';
        avgTurnaroundTimeElement.textContent = '-';
    }
    
    function getProcesses() {
        const processes = [];
        const rows = processTableBody.querySelectorAll('tr');
        
        rows.forEach((row, index) => {
            const pid = row.cells[0].textContent;
            const burstTime = parseInt(row.querySelector('.burst-time').value) || 0;
            const arrivalTime = parseInt(row.querySelector('.arrival-time').value) || 0;
            const priorityInput = row.querySelector('.priority');
            const priority = priorityInput ? (parseInt(priorityInput.value) || 1) : 1;
            const color = row.dataset.color;
            
            if (burstTime > 0) {
                processes.push({
                    pid,
                    burstTime,
                    arrivalTime,
                    priority,
                    color,
                    remainingTime: burstTime, // For Round Robin
                    waitingTime: 0,
                    turnaroundTime: 0,
                    completionTime: 0,
                    index // To maintain original order
                });
            }
        });
        
        return processes;
    }
    
    function calculateAndDisplayResults(algorithm) {
        let processes = getProcesses();
        
        if (processes.length === 0) return;
        
        // Sort and calculate based on algorithm
        switch (algorithm) {
            case 'fcfs':
                processes = fcfs(processes);
                break;
            case 'sjf':
                processes = sjf(processes);
                break;
            case 'priority':
                processes = priorityScheduling(processes);
                break;
            case 'rr':
                const timeQuantum = parseInt(timeQuantumInput.value) || 2;
                processes = roundRobin(processes, timeQuantum);
                break;
        }
        
        // Update UI with results
        updateProcessTable(processes);
        calculateAverageWaitingTime();
        calculateAverageTurnaroundTime();
    }
    
    function calculateWaitingTimes(algorithm) {
        let processes = getProcesses();
        
        if (processes.length === 0) return;
        
        // Sort and calculate based on algorithm
        switch (algorithm) {
            case 'fcfs':
                processes = fcfs(processes);
                break;
            case 'sjf':
                processes = sjf(processes);
                break;
            case 'priority':
                processes = priorityScheduling(processes);
                break;
            case 'rr':
                const timeQuantum = parseInt(timeQuantumInput.value) || 2;
                processes = roundRobin(processes, timeQuantum);
                break;
        }
        
        // Update only waiting times in UI
        updateWaitingTimes(processes);
    }
    
    function calculateTurnaroundTimes(algorithm) {
        let processes = getProcesses();
        
        if (processes.length === 0) return;
        
        // Sort and calculate based on algorithm
        switch (algorithm) {
            case 'fcfs':
                processes = fcfs(processes);
                break;
            case 'sjf':
                processes = sjf(processes);
                break;
            case 'priority':
                processes = priorityScheduling(processes);
                break;
            case 'rr':
                const timeQuantum = parseInt(timeQuantumInput.value) || 2;
                processes = roundRobin(processes, timeQuantum);
                break;
        }
        
        // Update only turnaround times in UI
        updateTurnaroundTimes(processes);
    }
    
    function updateProcessTable(processes) {
        const rows = processTableBody.querySelectorAll('tr');
        
        processes.forEach(process => {
            rows.forEach(row => {
                if (row.cells[0].textContent === process.pid) {
                    row.querySelector('.waiting-time').textContent = process.waitingTime;
                    row.querySelector('.turnaround-time').textContent = process.turnaroundTime;
                }
            });
        });
    }
    
    function updateWaitingTimes(processes) {
        const rows = processTableBody.querySelectorAll('tr');
        
        processes.forEach(process => {
            rows.forEach(row => {
                if (row.cells[0].textContent === process.pid) {
                    row.querySelector('.waiting-time').textContent = process.waitingTime;
                }
            });
        });
    }
    
    function updateTurnaroundTimes(processes) {
        const rows = processTableBody.querySelectorAll('tr');
        
        processes.forEach(process => {
            rows.forEach(row => {
                if (row.cells[0].textContent === process.pid) {
                    row.querySelector('.turnaround-time').textContent = process.turnaroundTime;
                }
            });
        });
    }
    
    function calculateAverageWaitingTime() {
        const waitingTimes = Array.from(document.querySelectorAll('.waiting-time'))
            .map(cell => cell.textContent)
            .filter(time => time !== '-')
            .map(time => parseInt(time));
        
        if (waitingTimes.length > 0) {
            const sum = waitingTimes.reduce((acc, val) => acc + val, 0);
            const avg = (sum / waitingTimes.length).toFixed(2);
            avgWaitingTimeElement.textContent = avg;
        } else {
            avgWaitingTimeElement.textContent = '-';
        }
    }
    
    function calculateAverageTurnaroundTime() {
        const turnaroundTimes = Array.from(document.querySelectorAll('.turnaround-time'))
            .map(cell => cell.textContent)
            .filter(time => time !== '-')
            .map(time => parseInt(time));
        
        if (turnaroundTimes.length > 0) {
            const sum = turnaroundTimes.reduce((acc, val) => acc + val, 0);
            const avg = (sum / turnaroundTimes.length).toFixed(2);
            avgTurnaroundTimeElement.textContent = avg;
        } else {
            avgTurnaroundTimeElement.textContent = '-';
        }
    }
    
    // ====== CPU Scheduling Algorithms ======
    
    // First-Come, First-Served (FCFS)
    function fcfs(processes) {
        // Sort by arrival time
        processes.sort((a, b) => {
            if (a.arrivalTime !== b.arrivalTime) {
                return a.arrivalTime - b.arrivalTime;
            }
            return a.index - b.index; // If same arrival time, maintain original order
        });
        
        let currentTime = 0;
        const executionSequence = [];
        
        processes.forEach(process => {
            // If CPU is idle, update current time to when the next process arrives
            if (currentTime < process.arrivalTime) {
                currentTime = process.arrivalTime;
            }
            
            // Calculate waiting time
            process.waitingTime = currentTime - process.arrivalTime;
            
            // Add to execution sequence
            executionSequence.push({
                pid: process.pid,
                startTime: currentTime,
                endTime: currentTime + process.burstTime,
                color: process.color
            });
            
            // Update current time
            currentTime += process.burstTime;
            
            // Calculate completion time and turnaround time
            process.completionTime = currentTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
        });
        
        // Attach execution sequence to processes
        processes.executionSequence = executionSequence;
        
        return processes;
    }
    
    // Shortest Job First (SJF)
    function sjf(processes) {
        // Create a copy of processes to avoid modifying the original array
        const processQueue = [...processes];
        
        // Sort by arrival time initially
        processQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const executedProcesses = [];
        const executionSequence = [];
        const readyQueue = [];
        
        while (processQueue.length > 0 || readyQueue.length > 0) {
            // Move arrived processes to ready queue
            while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
                readyQueue.push(processQueue.shift());
            }
            
            if (readyQueue.length === 0) {
                // CPU is idle, jump to the next process arrival time
                currentTime = processQueue[0].arrivalTime;
                continue;
            }
            
            // Sort ready queue by burst time (shortest first)
            readyQueue.sort((a, b) => {
                if (a.burstTime !== b.burstTime) {
                    return a.burstTime - b.burstTime;
                }
                return a.arrivalTime - b.arrivalTime; // If same burst time, earlier arrival
            });
            
            // Execute the shortest process
            const process = readyQueue.shift();
            
            // Calculate waiting time
            process.waitingTime = currentTime - process.arrivalTime;
            
            // Add to execution sequence
            executionSequence.push({
                pid: process.pid,
                startTime: currentTime,
                endTime: currentTime + process.burstTime,
                color: process.color
            });
            
            // Update current time
            currentTime += process.burstTime;
            
            // Calculate completion time and turnaround time
            process.completionTime = currentTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            
            executedProcesses.push(process);
        }
        
        // Attach execution sequence to executed processes
        executedProcesses.executionSequence = executionSequence;
        
        return executedProcesses;
    }
    
    // Priority Scheduling
    function priorityScheduling(processes) {
        // Create a copy of processes to avoid modifying the original array
        const processQueue = [...processes];
        
        // Sort by arrival time initially
        processQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const executedProcesses = [];
        const executionSequence = [];
        const readyQueue = [];
        
        while (processQueue.length > 0 || readyQueue.length > 0) {
            // Move arrived processes to ready queue
            while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
                readyQueue.push(processQueue.shift());
            }
            
            if (readyQueue.length === 0) {
                // CPU is idle, jump to the next process arrival time
                currentTime = processQueue[0].arrivalTime;
                continue;
            }
            
            // Sort ready queue by priority (lower number = higher priority)
            readyQueue.sort((a, b) => {
                if (a.priority !== b.priority) {
                    return a.priority - b.priority;
                }
                return a.arrivalTime - b.arrivalTime; // If same priority, earlier arrival
            });
            
            // Execute the highest priority process
            const process = readyQueue.shift();
            
            // Calculate waiting time
            process.waitingTime = currentTime - process.arrivalTime;
            
            // Add to execution sequence
            executionSequence.push({
                pid: process.pid,
                startTime: currentTime,
                endTime: currentTime + process.burstTime,
                color: process.color
            });
            
            // Update current time
            currentTime += process.burstTime;
            
            // Calculate completion time and turnaround time
            process.completionTime = currentTime;
            process.turnaroundTime = process.completionTime - process.arrivalTime;
            
            executedProcesses.push(process);
        }
        
        // Attach execution sequence to executed processes
        executedProcesses.executionSequence = executionSequence;
        
        return executedProcesses;
    }
    
    // Round Robin
    function roundRobin(processes, timeQuantum) {
        // Create a copy of processes to avoid modifying the original array
        const processQueue = [...processes];
        
        // Sort by arrival time initially
        processQueue.sort((a, b) => a.arrivalTime - b.arrivalTime);
        
        let currentTime = 0;
        const executedProcesses = [];
        const executionSequence = [];
        const readyQueue = [];
        
        // Map to track process completion status
        const completedProcesses = new Map();
        
        // Create a map for waiting time and turnaround time
        const waitingTimeMap = new Map();
        const turnaroundTimeMap = new Map();
        const completionTimeMap = new Map();
        
        // Initialize waiting time for each process
        processes.forEach(process => {
            waitingTimeMap.set(process.pid, 0);
        });
        
        while (processQueue.length > 0 || readyQueue.length > 0) {
            // Move arrived processes to ready queue
            while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
                readyQueue.push(processQueue.shift());
            }
            
            if (readyQueue.length === 0) {
                // CPU is idle, jump to the next process arrival time
                currentTime = processQueue[0].arrivalTime;
                continue;
            }
            
            // Get next process from ready queue
            const process = readyQueue.shift();
            
            // Calculate execution time for this quantum
            const executionTime = Math.min(timeQuantum, process.remainingTime);
            
            // Add to execution sequence
            executionSequence.push({
                pid: process.pid,
                startTime: currentTime,
                endTime: currentTime + executionTime,
                color: process.color
            });
            
            // Update process remaining time
            process.remainingTime -= executionTime;
            
            // Update current time
            currentTime += executionTime;
            
            // Check if process is completed
            if (process.remainingTime === 0) {
                // Mark as completed
                completedProcesses.set(process.pid, true);
                completionTimeMap.set(process.pid, currentTime);
                
                // Calculate turnaround time
                turnaroundTimeMap.set(process.pid, currentTime - process.arrivalTime);
            } else {
                // Move arrived processes during this execution to ready queue
                while (processQueue.length > 0 && processQueue[0].arrivalTime <= currentTime) {
                    readyQueue.push(processQueue.shift());
                }
                
                // Put the process back in the ready queue
                readyQueue.push(process);
            }
        }
        
        // Calculate waiting time for each process
        // Waiting time = Turnaround time - Burst time
        processes.forEach(process => {
            const turnaroundTime = turnaroundTimeMap.get(process.pid);
            process.waitingTime = turnaroundTime - process.burstTime;
            process.turnaroundTime = turnaroundTime;
            process.completionTime = completionTimeMap.get(process.pid);
        });
        
        // Attach execution sequence to processes
        processes.executionSequence = executionSequence;
        
        return processes;
    }
});