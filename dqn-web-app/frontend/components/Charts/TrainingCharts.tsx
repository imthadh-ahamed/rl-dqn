import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingMetrics } from '@/types';
import { calculateMovingAverage, formatNumber } from '@/lib/utils';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface TrainingChartsProps {
  metrics: TrainingMetrics;
}

export function TrainingCharts({ metrics }: TrainingChartsProps) {
  const { scores, losses, epsilons, episode, is_solved } = metrics;

  // Calculate moving average for scores
  const movingAverage = calculateMovingAverage(scores, 20);

  // Episode rewards chart data
  const rewardsChartData = {
    labels: scores.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Episode Reward',
        data: scores,
        borderColor: 'rgba(59, 130, 246, 0.6)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1,
      },
      {
        label: '20-Episode Moving Average',
        data: movingAverage,
        borderColor: 'rgba(239, 68, 68, 0.8)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  // Loss chart data
  const lossChartData = {
    labels: losses.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Training Loss',
        data: losses,
        borderColor: 'rgba(34, 197, 94, 0.8)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  // Epsilon decay chart data
  const epsilonChartData = {
    labels: epsilons.map((_, i) => i + 1),
    datasets: [
      {
        label: 'Epsilon (Exploration Rate)',
        data: epsilons,
        borderColor: 'rgba(168, 85, 247, 0.8)',
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Episode',
        },
      },
      y: {
        beginAtZero: true,
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
    animation: {
      duration: 0, // Disable animations for real-time updates
    },
  };

  const lossChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'MSE Loss',
        },
      },
    },
  };

  const epsilonChartOptions = {
    ...chartOptions,
    scales: {
      ...chartOptions.scales,
      y: {
        beginAtZero: true,
        max: 1,
        title: {
          display: true,
          text: 'Epsilon Value',
        },
      },
    },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Episode Rewards Chart */}
      <Card className="col-span-1 lg:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Episode Rewards
            {is_solved && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                🎉 SOLVED!
              </span>
            )}
          </CardTitle>
          <CardDescription>
            Episode rewards over time with 20-episode moving average
            {scores.length > 0 && (
              <span className="ml-2 text-sm font-medium">
                Latest: {formatNumber(scores[scores.length - 1], 0)} | 
                Best: {formatNumber(Math.max(...scores), 0)} |
                Avg: {formatNumber(scores.reduce((a, b) => a + b, 0) / scores.length, 1)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            {scores.length > 0 ? (
              <Line data={rewardsChartData} options={chartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No training data yet. Start training to see charts.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Training Loss Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Training Loss</CardTitle>
          <CardDescription>
            Mean squared error loss over episodes
            {losses.length > 0 && (
              <span className="block text-sm font-medium mt-1">
                Latest: {formatNumber(losses[losses.length - 1], 4)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {losses.length > 0 ? (
              <Line data={lossChartData} options={lossChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No loss data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Epsilon Decay Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Epsilon Decay</CardTitle>
          <CardDescription>
            Exploration rate (ε) decay over episodes
            {epsilons.length > 0 && (
              <span className="block text-sm font-medium mt-1">
                Current: {formatNumber(epsilons[epsilons.length - 1], 3)}
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            {epsilons.length > 0 ? (
              <Line data={epsilonChartData} options={epsilonChartOptions} />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                No epsilon data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
