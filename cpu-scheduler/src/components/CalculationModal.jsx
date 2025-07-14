import React from "react";

// Algorithm explanations (same as before)
const algoInfo = {
  fcfs: { name: "First-Come, First-Served (FCFS)", explanation: "FCFS schedules processes in the order they arrive. Each process waits until all previous processes have finished." },
  sjf: { name: "Shortest Job First (SJF)", explanation: "SJF schedules the process with the shortest burst time among those that have arrived." },
  priority: { name: "Priority Scheduling", explanation: "Priority scheduling runs the process with the highest priority (lowest number) next." },
  rr: { name: "Round Robin (RR)", explanation: "Round Robin gives each process a time quantum and cycles through the ready queue." }
};

const calcTypeInfo = {
  all: { label: "All Calculations", formula: "" },
  waiting: { label: "Waiting Time Calculation", formula: "Waiting Time = Start Time - Arrival Time" },
  turnaround: { label: "Turnaround Time Calculation", formula: "Turnaround Time = Completion Time - Arrival Time" },
  avgWaiting: {
    label: "Average Waiting Time Calculation",
    formula: "Average Waiting Time = (Sum of Waiting Times) / Number of Processes",
    explanation: "Average Waiting Time = Sum of all processes' waiting times / Number of processes"
  },
  avgTurnaround: {
    label: "Average Turnaround Time Calculation",
    formula: "Average Turnaround Time = (Sum of Turnaround Times) / Number of Processes",
    explanation: "Average Turnaround Time = Sum of all processes' turnaround times / Number of processes"
  }
};

// GanttChart (same as before)
function GanttChart({ steps }) {
  if (!steps || steps.length === 0) return null;
  return (
    <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
      {steps.map((step, i) => (
        <div
          key={i}
          style={{
            background: step.color,
            color: "#222",
            minWidth: 40,
            padding: "0.5em 0",
            textAlign: "center",
            borderRadius: 4,
            marginRight: 4,
            fontWeight: 600
          }}
        >
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

// Util: Calculate waiting and turnaround times for FCFS
function getFCFSWaitingAndTurnaround(processes) {
  const waiting = [0];
  for (let i = 1; i < processes.length; i++) {
    waiting[i] = waiting[i - 1] + processes[i - 1].burstTime;
  }
  const turnaround = processes.map((p, i) => waiting[i] + p.burstTime);
  return { waiting, turnaround };
}

// --- NEW: Waiting Table for FCFS ---
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
        {processes.map((p, i) => (
          <tr key={p.pid}>
            <td style={tdStyle}>{p.pid}</td>
            <td style={tdStyle}>{p.burstTime}</td>
            <td style={tdStyle}>
              {i === 0
                ? `WT(${p.pid}) = 0 (first process)`
                : `WT(${p.pid}) = WT(${processes[i - 1].pid}) + BT(${processes[i - 1].pid}) = ${waiting[i - 1]} + ${processes[i - 1].burstTime} = ${waiting[i]}`
              }
            </td>
            <td style={tdStyle}>{waiting[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Turnaround Table (FCFS)
function FCFSTurnaroundTable({ processes }) {
  const { waiting, turnaround } = getFCFSWaitingAndTurnaround(processes);
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
            <td style={tdStyle}>{`${waiting[i]} + ${p.burstTime} = ${turnaround[i]}`}</td>
            <td style={tdStyle}>{turnaround[i]}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// SJF/PRIORITY/RR Turnaround Table (reuse logic, simplified)
function GenericTurnaroundTable({ processes, waitingTimes, turnaroundTimes }) {
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
            <td style={tdStyle}>{waitingTimes[i]}</td>
            <td style={tdStyle}>{`${waitingTimes[i]} + ${p.burstTime} = ${turnaroundTimes[i]}`}</td>
            <td style={tdStyle}>{turnaroundTimes[i]}</td>
          </tr>
        ))}
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
      <div style={{ marginTop: 4, marginBottom: 8 }}>
        {formula}
      </div>
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

  // Added: Show Waiting Table for FCFS
  const showWaitingTable = calcType === "waiting" && Array.isArray(processes) && processes.length > 0;

  let waitingTable = null;
  if (showWaitingTable && algorithm === "fcfs") {
    waitingTable = <FCFSWaitingTable processes={processes} />;
  }

  // Recognize which table to show for Turnaround
  const showTurnaroundTable = calcType === "turnaround" && Array.isArray(processes) && processes.length > 0;

  // FCFS Turnaround Table
  let turnaroundTable = null;
  if (showTurnaroundTable) {
    if (algorithm === "fcfs") {
      turnaroundTable = <FCFSTurnaroundTable processes={processes} />;
    } else if ((algorithm === "sjf" || algorithm === "priority" || algorithm === "rr") && waitingTimes && turnaroundTimes) {
      turnaroundTable = (
        <GenericTurnaroundTable
          processes={processes}
          waitingTimes={waitingTimes}
          turnaroundTimes={turnaroundTimes}
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
    waiting: (
      <>
        <div>
          In First-Come, First-Served scheduling, processes are executed in the order they arrive in the ready queue. The waiting time for each process is calculated as follows:
        </div>
        <ul>
          <li>The first process has a waiting time of 0</li>
          <li>For subsequent processes, waiting time = previous process waiting time + previous process burst time</li>
          <li>Formula: <code>wt[i] = bt[i-1] + wt[i-1]</code></li>
        </ul>
      </>
    )
  }[calcType];

  // Formula for each
  const avgFormula = {
    avgWaiting: `Average WT = (Sum of Waiting Times) / ${processes?.length || "n"}`,
    avgTurnaround: `Average TAT = (Sum of Turnaround Times) / ${processes?.length || "n"}`
  }[calcType];

  return (
    <div
      style={{
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
      }}
    >
      <div
        style={{
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
        }}
      >
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
          &times;
        </button>
        <h3 style={{ marginBottom: 8 }}>
          {algo.name} - {calc.label}
        </h3>
        <div style={{ marginBottom: 16 }}>
          <b>Process Execution Timeline:</b>
          <GanttChart steps={ganttSteps} />
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