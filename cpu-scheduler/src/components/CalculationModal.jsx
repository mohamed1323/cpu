// Algorithm explanations
const algoInfo = {
  fcfs: { name: "First-Come, First-Served (FCFS)", explanation: "FCFS schedules processes in the order they arrive." },
  sjf: { name: "Shortest Job First (SJF)", explanation: "SJF schedules the process with the shortest burst time." },
  priority: { name: "Priority Scheduling", explanation: "Priority scheduling runs the process with the highest priority next." },
  rr: { name: "Round Robin (RR)", explanation: "Round Robin gives each process a fixed time quantum (time slice). If a process doesn't complete in its quantum, it's preempted and moved to the back of the ready queue." }
};

const calcTypeInfo = {
  all: { label: "All Calculations", formula: "" },
  waiting: { label: "Waiting Time Calculation", formula: "Waiting Time = Start Time - Arrival Time" },
  turnaround: { label: "Turnaround Time Calculation", formula: "Turnaround Time = Completion Time - Arrival Time" },
  avgWaiting: {
      label: "Average Waiting Time Calculation",
      formula: "Average Waiting Time = (Sum of Waiting Times) / Number of Processes"
  },
  avgTurnaround: {
      label: "Average Turnaround Time Calculation",
      formula: "Average Turnaround Time = (Sum of Turnaround Times) / Number of Processes"
  }
};

// GanttChart
function GanttChart({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
          {steps.map((step, i) => (
              <div key={i} style={{
                  background: step.color,
                  color: "#222",
                  minWidth: 40,
                  padding: "0.5em 0",
                  textAlign: "center",
                  borderRadius: 4,
                  marginRight: 4,
                  fontWeight: 600
              }}>
                  {step.pid}
              </div>
          ))}
          <div style={{ marginLeft: 8, color: "#888" }}>
              {steps.map((step, i) => (
                  <span key={i} style={{ marginRight: 32 }}>{step.start}</span>
              ))}
              <span>{steps[steps.length - 1].end}</span>
          </div>
      </div>
  );
}

// Helper function to get process color
function getProcessColor(pid) {
  const colors = ['#FF9AA2', '#FFB7B2', '#FFDAC1', '#E2F0CB', '#B5EAD7', '#C7CEEA'];
  const index = parseInt(pid.slice(1)) % colors.length;
  return colors[index];
}

// Util: Calculate waiting and turnaround times for FCFS
function getFCFSWaitingAndTurnaround(processes) {
  const waiting = [0];
  for (let i = 1; i < processes.length; i++) {
      waiting[i] = waiting[i - 1] + processes[i - 1].burstTime;
  }
  const turnaround = processes.map((p, i) => waiting[i] + p.burstTime);
  return { waiting, turnaround };
}

// Util: Calculate waiting and turnaround times for SJF
function getSJFWaitingAndTurnaround(processes) {
  const sortedProcesses = [...processes].sort((a, b) => a.burstTime - b.burstTime);
  const waiting = [0];
  for (let i = 1; i < sortedProcesses.length; i++) {
      waiting[i] = waiting[i - 1] + sortedProcesses[i - 1].burstTime;
  }
  const turnaround = sortedProcesses.map((p, i) => waiting[i] + p.burstTime);
  return { waiting, turnaround };
}

// Util: Calculate waiting and turnaround times for Priority Scheduling
function getPriorityWaitingAndTurnaround(processes) {
  const sortedProcesses = [...processes].sort((a, b) => a.priority - b.priority);
  const waiting = [0];
  for (let i = 1; i < sortedProcesses.length; i++) {
    waiting[i] = waiting[i - 1] + sortedProcesses[i - 1].burstTime;
  }
  const turnaround = sortedProcesses.map((p, i) => waiting[i] + p.burstTime);
  return { waiting, turnaround, sortedProcesses };
}

// Util: Calculate Round Robin scheduling
function getRRWaitingAndTurnaround(processes, quantum = 1) {
  const remainingTime = processes.map(p => p.burstTime);
  const waitingTimes = processes.map(() => 0);
  const turnaroundTimes = processes.map(() => 0);
  const ganttSteps = [];
  const perRoundSchedule = [];
  let time = 0;
  let completed = 0;
  let currentRound = 1;

  while (completed < processes.length) {
    let anyProcessExecuted = false;
    
    for (let i = 0; i < processes.length; i++) {
      if (remainingTime[i] > 0) {
        anyProcessExecuted = true;
        const startTime = time;
        const executionTime = Math.min(quantum, remainingTime[i]);
        
        // Record per-round schedule
        perRoundSchedule.push({
          round: currentRound,
          process: processes[i].pid,
          start: startTime,
          run: executionTime,
          remainingBefore: remainingTime[i],
          remainingAfter: remainingTime[i] - executionTime
        });
        
        // Update Gantt chart
        ganttSteps.push({
          pid: processes[i].pid,
          start: startTime,
          end: startTime + executionTime,
          color: getProcessColor(processes[i].pid)
        });
        
        // Update remaining time
        remainingTime[i] -= executionTime;
        time += executionTime;
        
        // Update waiting times for other processes
        for (let j = 0; j < processes.length; j++) {
          if (j !== i && remainingTime[j] > 0) {
            waitingTimes[j] += executionTime;
          }
        }
        
        // If process completed
        if (remainingTime[i] === 0) {
          completed++;
          turnaroundTimes[i] = time;
        }
      }
    }
    
    if (anyProcessExecuted) {
      currentRound++;
    }
  }

  return { waitingTimes, turnaroundTimes, ganttSteps, perRoundSchedule };
}

// Waiting Table for FCFS
function FCFSWaitingTable({ processes }) {
  const waiting = [0];
  for (let i = 1; i < processes.length; i++) {
      waiting[i] = waiting[i - 1] + processes[i - 1].burstTime;
  }
  return (
      <table style={tableStyle}>
          <thead>
              <tr style={{ background: "#f3f3f3" }}>
                  <th style={thStyle}>Process</th>
                  <th style={thStyle}>Burst Time</th>
                  <th style={thStyle}>Calculation</th>
                  <th style={thStyle}>Result</th>
              </tr>
          </thead>
          <tbody>
              {processes.map((p, i) => {
                  const prevWait = i === 0 ? 0 : waiting[i - 1];
                  const prevBurst = i === 0 ? 0 : processes[i - 1].burstTime;
                  return (
                      <tr key={p.pid}>
                          <td style={tdStyle}>{p.pid}</td>
                          <td style={tdStyle}>{p.burstTime}</td>
                          <td style={tdStyle}>
                              {i === 0
                                  ? `WT(${p.pid}) = 0 (first process)`
                                  : `WT(${p.pid}) = WT(${processes[i - 1].pid}) + BT(${processes[i - 1].pid}) = ${prevWait} + ${prevBurst} = ${waiting[i]}`}
                          </td>
                          <td style={tdStyle}>{waiting[i]}</td>
                      </tr>
                  );
              })}
          </tbody>
      </table>
  );
}

// Waiting Table for SJF
function SJFWaitingTable({ processes }) {
  const waiting = getSJFWaitingAndTurnaround(processes).waiting;
  return (
      <table style={tableStyle}>
          <thead>
              <tr style={{ background: "#f3f3f3" }}>
                  <th style={thStyle}>Process</th>
                  <th style={thStyle}>Burst Time</th>
                  <th style={thStyle}>Calculation</th>
                  <th style={thStyle}>Result</th>
              </tr>
          </thead>
          <tbody>
              {processes.map((p, i) => {
                  const prevWait = i === 0 ? 0 : waiting[i - 1];
                  const prevBurst = i === 0 ? 0 : processes[i - 1].burstTime;
                  return (
                      <tr key={p.pid}>
                          <td style={tdStyle}>{p.pid}</td>
                          <td style={tdStyle}>{p.burstTime}</td>
                          <td style={tdStyle}>
                              {i === 0
                                  ? `WT(${p.pid}) = 0 (first process)`
                                  : `WT(${p.pid}) = WT(${processes[i - 1].pid}) + BT(${processes[i - 1].pid}) = ${prevWait} + ${prevBurst} = ${waiting[i]}`}
                          </td>
                          <td style={tdStyle}>{waiting[i]}</td>
                      </tr>
                  );
              })}
          </tbody>
      </table>
  );
}

// Waiting Table for Priority Scheduling
function PriorityWaitingTable({ processes }) {
  const { waiting, sortedProcesses } = getPriorityWaitingAndTurnaround(processes);
  return (
    <table style={tableStyle}>
      <thead>
        <tr style={{ background: "#f3f3f3" }}>
          <th style={thStyle}>Order</th>
          <th style={thStyle}>Process</th>
          <th style={thStyle}>Priority</th>
          <th style={thStyle}>Burst Time</th>
          <th style={thStyle}>Calculation</th>
          <th style={thStyle}>Waiting Time</th>
        </tr>
      </thead>
      <tbody>
        {sortedProcesses.map((p, i) => {
          const prevWait = i === 0 ? 0 : waiting[i - 1];
          const prevBurst = i === 0 ? 0 : sortedProcesses[i - 1].burstTime;
          return (
            <tr key={p.pid}>
              <td style={tdStyle}>{i + 1}</td>
              <td style={tdStyle}>{p.pid}</td>
              <td style={tdStyle}>{p.priority}</td>
              <td style={tdStyle}>{p.burstTime}</td>
              <td style={tdStyle}>
                {i === 0
                  ? `WT(${p.pid}) = 0 (highest priority)`
                  : `WT(${p.pid}) = WT(${sortedProcesses[i - 1].pid}) + BT(${sortedProcesses[i - 1].pid}) = ${prevWait} + ${prevBurst} = ${waiting[i]}`}
              </td>
              <td style={tdStyle}>{waiting[i]}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Waiting Table for Round Robin
function RRWaitingTable({ processes, perRoundSchedule }) {
  return (
    <div>
      <h4>Process Execution Timeline:</h4>
      <div style={{ marginBottom: '16px' }}>
        {perRoundSchedule.map((step, i) => (
          <span key={i} style={{ marginRight: '8px' }}>{step.process}</span>
        ))}
      </div>
      <div style={{ marginBottom: '24px' }}>
        {perRoundSchedule.map((step, i) => (
          <span key={i} style={{ marginRight: '32px' }}>{step.start}</span>
        ))}
        <span>{perRoundSchedule[perRoundSchedule.length - 1].start + perRoundSchedule[perRoundSchedule.length - 1].run}</span>
      </div>

      <h4>Per-Round Schedule</h4>
      <table style={tableStyle}>
        <thead>
          <tr style={{ background: "#f3f3f3" }}>
            <th style={thStyle}>Round</th>
            <th style={thStyle}>Process</th>
            <th style={thStyle}>Start</th>
            <th style={thStyle}>Run</th>
            <th style={thStyle}>Remaining Before</th>
            <th style={thStyle}>Remaining After</th>
          </tr>
        </thead>
        <tbody>
          {perRoundSchedule.map((step, i) => (
            <tr key={i}>
              <td style={tdStyle}>{step.round}</td>
              <td style={tdStyle}>{step.process}</td>
              <td style={tdStyle}>{step.start}</td>
              <td style={tdStyle}>{step.run}</td>
              <td style={tdStyle}>{step.remainingBefore}</td>
              <td style={tdStyle}>{step.remainingAfter}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Turnaround Table for FCFS
function FCFSTurnaroundTable({ processes }) {
  const { waiting } = getFCFSWaitingAndTurnaround(processes);
  return (
      <table style={tableStyle}>
          <thead>
              <tr style={{ background: "#f3f3f3" }}>
                  <th style={thStyle}>Process</th>
                  <th style={thStyle}>Burst Time</th>
                  <th style={thStyle}>Waiting Time</th>
                  <th style={thStyle}>Calculation</th>
                  <th style={thStyle}>Turnaround Time</th>
              </tr>
          </thead>
          <tbody>
              {processes.map((p, i) => {
                  const waitingTime = Number(waiting[i]);
                  const burstTime = Number(p.burstTime);
                  const turnaroundTime = waitingTime + burstTime;
                  return (
                      <tr key={p.pid}>
                          <td style={tdStyle}>{p.pid}</td>
                          <td style={tdStyle}>{burstTime}</td>
                          <td style={tdStyle}>{waitingTime}</td>
                          <td style={tdStyle}>{`${waitingTime} + ${burstTime} = ${turnaroundTime}`}</td>
                          <td style={tdStyle}>{turnaroundTime}</td>
                      </tr>
                  );
              })}
          </tbody>
      </table>
  );
}

// Turnaround Table for SJF
function SJFTurnaroundTable({ processes }) {
  const { waiting } = getSJFWaitingAndTurnaround(processes);
  const turnaroundTimes = waiting.map((wt, i) => wt + processes[i].burstTime);
  return (
      <table style={tableStyle}>
          <thead>
              <tr style={{ background: "#f3f3f3" }}>
                  <th style={thStyle}>Process</th>
                  <th style={thStyle}>Burst Time</th>
                  <th style={thStyle}>Waiting Time</th>
                  <th style={thStyle}>Calculation</th>
                  <th style={thStyle}>Turnaround Time</th>
              </tr>
          </thead>
          <tbody>
              {processes.map((p, i) => (
                  <tr key={p.pid}>
                      <td style={tdStyle}>{p.pid}</td>
                      <td style={tdStyle}>{p.burstTime}</td>
                      <td style={tdStyle}>{waiting[i]}</td>
                      <td style={tdStyle}>{`${waiting[i]} + ${p.burstTime} = ${turnaroundTimes[i]}`}</td>
                      <td style={tdStyle}>{turnaroundTimes[i]}</td>
                  </tr>
              ))}
          </tbody>
      </table>
  );
}

// Turnaround Table for Priority Scheduling
function PriorityTurnaroundTable({ processes }) {
  const { waiting, sortedProcesses, turnaround } = getPriorityWaitingAndTurnaround(processes);
  return (
    <table style={tableStyle}>
      <thead>
        <tr style={{ background: "#f3f3f3" }}>
          <th style={thStyle}>Process</th>
          <th style={thStyle}>Priority</th>
          <th style={thStyle}>Burst Time</th>
          <th style={thStyle}>Waiting Time</th>
          <th style={thStyle}>Calculation</th>
          <th style={thStyle}>Turnaround Time</th>
        </tr>
      </thead>
      <tbody>
        {sortedProcesses.map((p, i) => (
          <tr key={p.pid}>
            <td style={tdStyle}>{p.pid}</td>
            <td style={tdStyle}>{p.priority}</td>
            <td style={tdStyle}>{p.burstTime}</td>
            <td style={tdStyle}>{waiting[i]}</td>
            <td style={tdStyle}>{`${waiting[i]} + ${p.burstTime} = ${turnaround[i]}`}</td>
            <td style={tdStyle}>{turnaround[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// NEW: Turnaround Table for Round Robin
function RRTurnaroundTable({ processes, waitingTimes }) {
  return (
    <table style={tableStyle}>
      <thead>
        <tr style={{ background: "#f3f3f3" }}>
          <th style={thStyle}>Process</th>
          <th style={thStyle}>Burst Time</th>
          <th style={thStyle}>Waiting Time</th>
          <th style={thStyle}>Calculation</th>
          <th style={thStyle}>Turnaround Time</th>
        </tr>
      </thead>
      <tbody>
        {processes.map((p, i) => {
          const burstTime = Number(p.burstTime);
          const waitingTime = Number(waitingTimes[i]);
          const turnaroundTime = waitingTime + burstTime;
          return (
            <tr key={p.pid}>
              <td style={tdStyle}>{p.pid}</td>
              <td style={tdStyle}>{burstTime}</td>
              <td style={tdStyle}>{waitingTime}</td>
              <td style={tdStyle}>{`${waitingTime} + ${burstTime} = ${turnaroundTime}`}</td>
              <td style={tdStyle}>{turnaroundTime}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

// Table styles
const tableStyle = {
  width: "100%",
  borderCollapse: "collapse",
  background: "#fff",
  marginTop: 16,
  fontSize: 16
};
const thStyle = { padding: 8, border: "1px solid #ddd", textAlign: "left" };
const tdStyle = { padding: 8, border: "1px solid #ddd" };

// For average result box
function ResultBox({ formula, result }) {
  return (
      <div style={{
          background: "#f5f6f8",
          borderRadius: 10,
          padding: "1.25em 2em",
          margin: "24px 0 0 0",
          fontSize: "1.07em"
      }}>
          <b>Formula:</b>
          <div style={{ marginTop: 4, marginBottom: 8 }}>{formula}</div>
          <b>Result: {result}</b>
      </div>
  );
}

function CalculationModal({
  show,
  onClose,
  algorithm,
  calcType,
  processes,
  ganttSteps,
  resultValue,
  timeQuantum = 2,
  waitingTimes,
  turnaroundTimes
}) {
  if (!show) return null;
  const algo = algoInfo[algorithm] || {};
  const calc = calcTypeInfo[calcType] || {};

  // Calculate RR data if needed
  let rrData = null;
  if (algorithm === "rr") {
    rrData = getRRWaitingAndTurnaround(processes, timeQuantum);
  }

  // Show Waiting Table for FCFS, SJF, Priority or RR
  const showWaitingTable = calcType === "waiting" && Array.isArray(processes) && processes.length > 0;
  let waitingTable = null;
  if (showWaitingTable) {
      if (algorithm === "fcfs") {
          waitingTable = <FCFSWaitingTable processes={processes} />;
      } else if (algorithm === "sjf") {
          waitingTable = <SJFWaitingTable processes={processes} />;
      } else if (algorithm === "priority") {
          waitingTable = <PriorityWaitingTable processes={processes} />;
      } else if (algorithm === "rr") {
          waitingTable = <RRWaitingTable processes={processes} perRoundSchedule={rrData?.perRoundSchedule || []} />;
      }
  }

  // Show Turnaround Table for FCFS, SJF, Priority or RR
  const showTurnaroundTable = calcType === "turnaround" && Array.isArray(processes) && processes.length > 0;
  let turnaroundTable = null;
  if (showTurnaroundTable) {
      if (algorithm === "fcfs") {
          turnaroundTable = <FCFSTurnaroundTable processes={processes} />;
      } else if (algorithm === "sjf") {
          turnaroundTable = <SJFTurnaroundTable processes={processes} />;
      } else if (algorithm === "priority") {
          turnaroundTable = <PriorityTurnaroundTable processes={processes} />;
      } else if (algorithm === "rr") {
          turnaroundTable = (
            <RRTurnaroundTable 
              processes={processes} 
              waitingTimes={rrData?.waitingTimes || []} 
            />
          );
      }
  }

  // Headline for each section
  const calcHeadline = {
      turnaround: `${algo.name} - Turnaround Time Calculation`,
      avgWaiting: `${algo.name} - Average Waiting Time Calculation`,
      avgTurnaround: `${algo.name} - Average Turnaround Time Calculation`,
      waiting: `${algo.name} - Waiting Time Calculation`,
  }[calcType];

  // Explanation for each
  const calcExplain = {
    turnaround: (
      <>
        <div>Turnaround Time = Completion Time - Arrival Time</div>
        <div>Or equivalently: Turnaround Time = Waiting Time + Burst Time</div>
      </>
    ),
    avgWaiting: "Average Waiting Time = Sum of all processes' waiting times / Number of processes",
    avgTurnaround: "Average Turnaround Time = Sum of all processes' turnaround times / Number of processes",
    waiting:
      algorithm === "rr" ? (
        <>
          <div>Round Robin gives each process a fixed time quantum.</div>
          <div>If a process doesn't complete in its quantum, it's moved to the back of the queue.</div>
          <div>Waiting time is calculated based on how long each process waits between executions.</div>
        </>
      ) : algorithm === "priority" ? (
        <>
          <p className="mb-3">
            In <strong>Priority Scheduling</strong>, the CPU is allocated to the
            process with the <em>highest</em> priority (i.e. the <em>lowest</em> numerical value).
            The waiting time for each process is computed cumulatively, using:
          </p>
          <p className="mb-4">
            <code>WT[i] = WT[i-1] + BT[i-1]</code> &nbsp;for&nbsp; i &gt; 0,&nbsp; and&nbsp;
            <code>WT[0] = 0</code>
          </p>
        </>
      ) : algorithm === "sjf" ? (
        <>
          <p className="mb-3">
            In <strong>Shortest-Job-First (SJF)</strong> scheduling, the CPU is
            allocated to the process with the <em>smallest</em> burst time among the
            processes that have already arrived. Below are the step-by-step waiting time
            calculations following that execution order.
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>The first selected process has a waiting time of <code>0</code>.</li>
            <li>
              For every other process:
              <br />
              <code>WT[i] = WT[i-1] + BT[i-1] + AT[i-1] − AT[i]</code>
            </li>
          </ul>
        </>
      ) : algorithm === "fcfs" ? (
        <>
          <p className="mb-3">
            In <strong>First-Come, First-Served (FCFS)</strong> scheduling, processes are executed in the
            order they arrive in the ready queue. The waiting time for each process is calculated as follows:
          </p>
          <ul className="list-disc ml-6 mb-4">
            <li>The first process has a waiting time of <code>0</code>.</li>
            <li>For subsequent processes, waiting time = previous process waiting time + previous process burst time.</li>
            <li>Formula: <code>WT[i] = BT[i-1] + WT[i-1]</code></li>
          </ul>
        </>
      ) : null
  }[calcType];
  
  // Formula for each
  const avgFormula = {
      avgWaiting: `Average WT = (Sum of Waiting Times) / ${processes?.length || "n"}`,
      avgTurnaround: `Average TAT = (Sum of Turnaround Times) / ${processes?.length || "n"}`
  }[calcType];

  return (
      <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
          background: "rgba(0,0,0,0.3)",
          zIndex: 9999,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
      }}>
          <div style={{
              background: "#fff",
              color: "#222",
              borderRadius: 12,
              maxWidth: 900,
              width: "100%",
              boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
              padding: 32,
              position: "relative",
              maxHeight: "90vh",
              overflowY: "auto"
          }}>
              <button
                  onClick={onClose}
                  style={{
                      position: "absolute",
                      top: 16,
                      right: 16,
                      background: "none",
                      border: "none",
                      fontSize: 24,
                      cursor: "pointer"
                  }}
              >
                  ×
              </button>
              <h3 style={{ marginBottom: 8 }}>
                  {algo.name} - {calc.label}
              </h3>
              <div style={{ marginBottom: 16 }}>
                  <b>Process Execution Timeline:</b>
                  <GanttChart steps={algorithm === "rr" ? rrData?.ganttSteps : ganttSteps} />
              </div>
              {/* Waiting Table */}
              {showWaitingTable && (
                  <>
                      <h4 style={{ margin: "24px 0 6px 0" }}>{calcHeadline}</h4>
                      <div style={{ marginBottom: 10 }}>{calcExplain}</div>
                      {waitingTable}
                  </>
              )}
              {/* Turnaround Table */}
              {showTurnaroundTable && (
                  <>
                      <h4 style={{ margin: "24px 0 6px 0" }}>{calcHeadline}</h4>
                      <div style={{ marginBottom: 10 }}>{calcExplain}</div>
                      {turnaroundTable}
                  </>
              )}
              {/* Average Waiting Time */}
              {calcType === "avgWaiting" && (
                  <>
                      <h4 style={{ margin: "24px 0 6px 0" }}>{calcHeadline}</h4>
                      <div style={{ marginBottom: 10 }}>{calcExplain}</div>
                      <ResultBox formula={avgFormula} result={resultValue} />
                  </>
              )}
              {/* Average Turnaround Time */}
              {calcType === "avgTurnaround" && (
                  <>
                      <h4 style={{ margin: "24px 0 6px 0" }}>{calcHeadline}</h4>
                      <div style={{ marginBottom: 10 }}>{calcExplain}</div>
                      <ResultBox formula={avgFormula} result={resultValue} />
                  </>
              )}
          </div>
      </div>
  );
}

export default CalculationModal;