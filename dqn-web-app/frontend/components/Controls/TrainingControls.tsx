import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { TrainingStatus, TrainingConfig } from '@/types';
import { useTraining } from '@/hooks/useTraining';
import { 
  Play, 
  Square, 
  Download, 
  Upload, 
  Settings, 
  Video,
  Save,
  RotateCcw
} from 'lucide-react';
import { getAlgorithmDisplayName, getTrainingStatusColor, formatNumber } from '@/lib/utils';

interface TrainingControlsProps {
  status: TrainingStatus | null;
}

export function TrainingControls({ status }: TrainingControlsProps) {
  const { startTraining, stopTraining, saveModel, generateVideo, state } = useTraining();
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<'dqn' | 'double_dqn'>('dqn');
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);

  const handleStartTraining = async () => {
    await startTraining(selectedAlgorithm);
  };

  const handleStopTraining = async () => {
    await stopTraining();
  };

  const handleSaveModel = async () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    await saveModel(`model_${selectedAlgorithm}_${timestamp}.pth`);
  };

  const handleGenerateVideo = async () => {
    setIsGeneratingVideo(true);
    try {
      await generateVideo('latest_demo.mp4');
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const isTraining = status?.is_training || false;
  const isSolved = status?.metrics?.is_solved || false;
  const agentCreated = status?.agent_created || false;

  return (
    <div className="space-y-6">
      {/* Training Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Training Status
            <span className={`status-indicator ${
              isSolved ? 'status-solved' : 
              isTraining ? 'status-training' : 
              'status-stopped'
            }`}>
              {isSolved ? '🏆 Solved' : isTraining ? '🔄 Training' : '⏸️ Stopped'}
            </span>
          </CardTitle>
          <CardDescription>
            Current training session information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="font-medium text-gray-500">Episode</div>
              <div className="text-lg font-semibold">
                {status?.metrics?.episode || 0}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Total Steps</div>
              <div className="text-lg font-semibold">
                {status?.metrics?.step || 0}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Algorithm</div>
              <div className="text-lg font-semibold">
                {status?.config ? getAlgorithmDisplayName(status.config.algorithm) : 'N/A'}
              </div>
            </div>
            <div>
              <div className="font-medium text-gray-500">Latest Score</div>
              <div className="text-lg font-semibold">
                {status?.metrics?.scores?.length ? 
                  status.metrics.scores[status.metrics.scores.length - 1] : 'N/A'}
              </div>
            </div>
          </div>

          {status?.metrics?.scores && status.metrics.scores.length >= 100 && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <div className="text-sm font-medium text-blue-900">
                Last 100 Episodes Average: {' '}
                <span className="text-lg">
                  {formatNumber(
                    status.metrics.scores.slice(-100).reduce((a, b) => a + b, 0) / 100,
                    1
                  )}
                </span>
                <span className="text-sm text-blue-600 ml-2">
                  (Target: 475.0 to solve)
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Training Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Training Controls</CardTitle>
          <CardDescription>
            Start, stop, and configure training sessions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Algorithm Selection */}
            <div>
              <label className="block text-sm font-medium mb-2">Algorithm</label>
              <select
                value={selectedAlgorithm}
                onChange={(e) => setSelectedAlgorithm(e.target.value as 'dqn' | 'double_dqn')}
                disabled={isTraining}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="dqn">Standard DQN</option>
                <option value="double_dqn">Double DQN</option>
              </select>
            </div>

            {/* Training Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleStartTraining}
                disabled={isTraining || state.isLoading}
                className="flex-1 min-w-0"
              >
                <Play className="mr-2 h-4 w-4" />
                {isTraining ? 'Training...' : 'Start Training'}
              </Button>

              <Button
                onClick={handleStopTraining}
                disabled={!isTraining || state.isLoading}
                variant="outline"
                className="flex-1 min-w-0"
              >
                <Square className="mr-2 h-4 w-4" />
                Stop Training
              </Button>
            </div>

            {/* Error Display */}
            {state.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{state.error}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Model Management */}
      <Card>
        <CardHeader>
          <CardTitle>Model Management</CardTitle>
          <CardDescription>
            Save, load, and manage trained models
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Button
              onClick={handleSaveModel}
              disabled={!agentCreated || state.isLoading}
              variant="outline"
              size="sm"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Model
            </Button>

            <Button
              onClick={handleGenerateVideo}
              disabled={!agentCreated || isGeneratingVideo}
              variant="outline"
              size="sm"
            >
              <Video className="mr-2 h-4 w-4" />
              {isGeneratingVideo ? 'Generating...' : 'Generate Video'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Display */}
      {status?.config && (
        <Card>
          <CardHeader>
            <CardTitle>Current Configuration</CardTitle>
            <CardDescription>
              Active hyperparameters for training
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium">Learning Rate:</span> {status.config.lr}
              </div>
              <div>
                <span className="font-medium">Gamma:</span> {status.config.gamma}
              </div>
              <div>
                <span className="font-medium">Epsilon Decay:</span> {status.config.epsilon_decay}
              </div>
              <div>
                <span className="font-medium">Buffer Size:</span> {status.config.buffer_size.toLocaleString()}
              </div>
              <div>
                <span className="font-medium">Batch Size:</span> {status.config.batch_size}
              </div>
              <div>
                <span className="font-medium">Target Score:</span> {status.config.target_score}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
