import React from 'react';

const TestComponent = ({ processes }) => {
  return (
    <div className="mt-3 p-3 bg-light border rounded">
      <h6>Debug Info:</h6>
      <div className="small">
        {processes.map(process => (
          <div key={process.id}>
            {process.pid}: Burst={process.burstTime}, Arrival={process.arrivalTime}, Priority={process.priority}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestComponent; 