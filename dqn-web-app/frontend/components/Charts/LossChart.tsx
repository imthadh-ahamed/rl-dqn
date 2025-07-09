
'use client';
import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface LossChartProps {
  losses: number[];
}

export const LossChart: React.FC<LossChartProps> = ({ losses }) => {
  const data = {
    labels: losses.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Training Loss',
        data: losses,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Training Loss Over Time',
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Episode',
        },
      },
      y: {
        title: {
          display: true,
          text: 'Loss',
        },
        type: 'logarithmic' as const,
      },
    },
    animation: {
      duration: 0,
    },
  };

  return (
    <div className="chart-container">
      <Line data={data} options={options} />
    </div>
  );
};
