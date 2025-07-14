# CPU Scheduling Algorithm Simulator

A React.js application that simulates various CPU scheduling algorithms with a modern, interactive interface.

## Features

- **Multiple Algorithms**: Supports FCFS, SJF, Priority Scheduling, and Round Robin
- **Interactive Process Management**: Add, delete, and modify processes dynamically
- **Real-time Calculations**: Calculate waiting time, turnaround time, and averages
- **Responsive Design**: Works on desktop and mobile devices
- **Modern UI**: Built with Bootstrap and custom CSS

## Supported Algorithms

1. **First-Come, First-Served (FCFS)**: Processes are executed in the order they arrive
2. **Shortest Job First (SJF)**: Process with the shortest burst time is executed first
3. **Priority Scheduling**: Process with the highest priority (lowest number) is executed first
4. **Round Robin**: Each process gets a fixed time slice (time quantum) to execute

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Installation

1. Clone or download the project
2. Navigate to the project directory:
   ```bash
   cd cpu-scheduler
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and go to `http://localhost:5173`

## Usage

1. **Select Algorithm**: Choose from the dropdown menu
2. **Configure Time Quantum**: For Round Robin, set the time quantum value
3. **Add Processes**: Click "Add Process" to add new processes
4. **Set Process Details**: Enter burst time, arrival time, and priority (if applicable)
5. **Calculate Results**: Use the calculation buttons to see results
6. **View Averages**: See average waiting and turnaround times

## Project Structure

```
cpu-scheduler/
├── src/
│   ├── components/
│   │   ├── AlgorithmSelector.jsx
│   │   ├── ProcessTable.jsx
│   │   ├── ResultsDisplay.jsx
│   │   └── CalculationButtons.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── main.jsx
│   └── index.css
├── public/
├── package.json
└── README.md
```

## Technologies Used

- **React.js**: Frontend framework
- **Vite**: Build tool and development server
- **Bootstrap**: CSS framework for styling
- **JavaScript**: Programming language

## Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run preview`: Preview production build

## Contributing

Feel free to contribute to this project by:
- Reporting bugs
- Suggesting new features
- Submitting pull requests

## License

This project is open source and available under the MIT License.
