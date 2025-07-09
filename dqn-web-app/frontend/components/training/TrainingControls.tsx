
'use client';
import React, { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { TrainingConfig } from '@/types';

interface TrainingControlsProps {
  onStartTraining: (config: TrainingConfig) => void;
  onStopTraining: () => void;
  onTestAgent: () => void;
  isTraining: boolean;
  loading: boolean;
}

export const TrainingControls: React.FC<TrainingControlsProps> = ({
  onStartTraining,
  onStopTraining,
  onTestAgent,
  isTraining,
  loading,
}) => {
  const [config, setConfig] = useState<TrainingConfig>({
    episodes: 500,
    learning_rate: 0.001,
    gamma: 0.95,
    epsilon: 1.0,
    epsilon_min: 0.01,
    epsilon_decay: 0.995,
    memory_size: 10000,
    batch_size: 32,
  });

  const handleStartTraining = () => {
    onStartTraining(config);
  };

  return (
    <Card title="Training Controls" className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Episodes
          </label>
          <input
            type="number"
            value={config.episodes}
            onChange={(e) => setConfig({ ...config, episodes: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Learning Rate
          </label>
          <input
            type="number"
            step="0.0001"
            value={config.learning_rate}
            onChange={(e) => setConfig({ ...config, learning_rate: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Gamma (Discount Factor)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="1"
            value={config.gamma}
            onChange={(e) => setConfig({ ...config, gamma: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Batch Size
          </label>
          <input
            type="number"
            value={config.batch_size}
            onChange={(e) => setConfig({ ...config, batch_size: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Memory Size
          </label>
          <input
            type="number"
            value={config.memory_size}
            onChange={(e) => setConfig({ ...config, memory_size: parseInt(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Epsilon Decay
          </label>
          <input
            type="number"
            step="0.001"
            min="0"
            max="1"
            value={config.epsilon_decay}
            onChange={(e) => setConfig({ ...config, epsilon_decay: parseFloat(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isTraining}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        {!isTraining ? (
          <Button
            onClick={handleStartTraining}
            loading={loading}
            disabled={loading}
          >
            Start Training
          </Button>
        ) : (
          <Button
            onClick={onStopTraining}
            variant="danger"
            loading={loading}
            disabled={loading}
          >
            Stop Training
          </Button>
        )}

        <Button
          onClick={onTestAgent}
          variant="secondary"
          loading={loading}
          disabled={loading || isTraining}
        >
          Test Agent
        </Button>
      </div>
    </Card>
  );
};
