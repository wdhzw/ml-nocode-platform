import React from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

function TrainingResults({ trainingHistory }) {
  if (!trainingHistory || !trainingHistory.loss) {
    return <p>No training data available</p>;
  }

  const data = {
    labels: trainingHistory.loss.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Training Loss',
        data: trainingHistory.loss,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1
      },
      {
        label: 'Validation Loss',
        data: trainingHistory.val_loss,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Training and Validation Loss'
      }
    }
  };

  return <Line data={data} options={options} />;
}

export default TrainingResults;