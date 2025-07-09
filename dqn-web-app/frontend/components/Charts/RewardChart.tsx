
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

interface RewardChartProps {
  episodeRewards: number[];
  averageReward: number;
}

export const RewardChart: React.FC<RewardChartProps> = ({ episodeRewards, averageReward }) => {
  const data = {
    labels: episodeRewards.map((_, index) => index + 1),
    datasets: [
      {
        label: 'Episode Reward',
        data: episodeRewards,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: 'Average Reward',
        data: new Array(episodeRewards.length).fill(averageReward),
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
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
        text: 'Episode Rewards Over Time',
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
          text: 'Reward',
        },
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
