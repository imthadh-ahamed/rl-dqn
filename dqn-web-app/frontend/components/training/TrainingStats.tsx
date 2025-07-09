
'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { TrainingStats as TrainingStatsType } from '@/types';

interface TrainingStatsProps {
  stats: TrainingStatsType | null;
  isTraining: boolean;
}

export const TrainingStats: React.FC<TrainingStatsProps> = ({ stats, isTraining }) => {
  if (!stats) {
    return (
      <Card title="Training Statistics">
        <p className="text-gray-500">No training data available</p>
      </Card>
    );
  }

  const progress = stats.total_episodes > 0 ? (stats.episode / stats.total_episodes) * 100 : 0;

  return (
    <Card title="Training Statistics">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {stats.episode}
          </div>
          <div className="text-sm text-gray-500">Episode</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            {stats.current_reward.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">Current Reward</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {stats.average_reward.toFixed(1)}
          </div>
          <div className="text-sm text-gray-500">Average Reward</div>
        </div>

        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">
            {stats.epsilon.toFixed(3)}
          </div>
          <div className="text-sm text-gray-500">Epsilon</div>
        </div>
      </div>

      {stats.total_episodes > 0 && (
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress</span>
            <span>{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-500">Total Episodes:</span>
          <span className="ml-2 font-medium">{stats.total_episodes}</span>
        </div>
        <div>
          <span className="text-gray-500">Current Loss:</span>
          <span className="ml-2 font-medium">{stats.loss.toFixed(6)}</span>
        </div>
      </div>

      {isTraining && (
        <div className="mt-4 flex items-center">
          <div className="animate-pulse rounded-full h-3 w-3 bg-green-500 mr-2"></div>
          <span className="text-sm text-green-600 font-medium">Training in progress...</span>
        </div>
      )}
    </Card>
  );
};
