import React from 'react';

const ProcessTable = ({ processes, algorithm, onDelete, onUpdate }) => {
  const handleInputChange = (id, field, value) => {
    onUpdate(id, field, value);
  };

  return (
    <div className="table-responsive">
      <table className="table table-bordered">
        <thead>
          <tr>
            <th className="text-center">Process ID</th>
            <th className="text-center">Burst Time</th>
            <th className="text-center">Arrival Time</th>
            <th className={`text-center priority-column ${algorithm !== 'priority' ? 'd-none' : ''}`}>
              Priority
            </th>
            <th className="text-center">Waiting Time</th>
            <th className="text-center">Turnaround Time</th>
            <th className="text-center">Actions</th>
          </tr>
        </thead>
        <tbody>
          {processes.map((process) => (
            <tr key={process.id} className="process-row">
              <td className="text-center">{process.pid}</td>
              <td>
                <input 
                  type="number" 
                  className="form-control input-field burst-time" 
                  min="1" 
                  value={process.burstTime}
                  onChange={(e) => handleInputChange(process.id, 'burstTime', e.target.value)}
                />
              </td>
              <td>
                <input 
                  type="number" 
                  className="form-control input-field arrival-time" 
                  min="0" 
                  value={process.arrivalTime}
                  onChange={(e) => handleInputChange(process.id, 'arrivalTime', e.target.value)}
                />
              </td>
              <td className={`priority-cell ${algorithm !== 'priority' ? 'd-none' : ''}`}>
                <input 
                  type="number" 
                  className="form-control input-field priority" 
                  min="1" 
                  value={process.priority}
                  onChange={(e) => handleInputChange(process.id, 'priority', e.target.value)}
                />
              </td>
              <td className="waiting-time text-center">
                {process.waitingTime !== '-' ? process.waitingTime : '-'}
              </td>
              <td className="turnaround-time text-center">
                {process.turnaroundTime !== '-' ? process.turnaroundTime : '-'}
              </td>
              <td className="text-center">
                <button 
                  className="btn btn-danger delete-btn delete-process"
                  onClick={() => onDelete(process.id)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ProcessTable; 