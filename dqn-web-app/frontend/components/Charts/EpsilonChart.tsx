
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

interface EpsilonChartProps {
  episode: number;
  epsilon: number;
  totalEpisodes: number;
}

export const EpsilonChart: React.FC<EpsilonChartProps> = ({ episode, epsilon, totalEpisodes }) => {
  // Generate epsilon decay curve
  const episodes = Array.from({ length: Math.min(episode + 100, totalEpisodes) }, (_, i) => i + 1);
  const epsilonValues = episodes.map(() => epsilon);

  const data = {
    labels: episodes,
    datasets: [
      {
        label: 'Epsilon (Exploration Rate)',
        data: epsilonValues,
        borderColor: 'rgb(168, 85, 247)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
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
        text: 'Epsilon Decay Over Time',
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
          text: 'Epsilon',
        },
        min: 0,
        max: 1,
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
