
import { useState, useCallback, useEffect } from 'react';
import { trainingApi } from '@/lib/api';
import { TrainingConfig, TrainingStatus, TestResults } from '@/types';
import { useWebSocket } from './useWebSocket';

export const useTraining = () => {
  const [status, setStatus] = useState<TrainingStatus | null>(null);
  const [testResults, setTestResults] = useState<TestResults | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { lastMessage } = useWebSocket();

  // Handle WebSocket messages
  useEffect(() => {
    if (lastMessage) {
      switch (lastMessage.type) {
        case 'training_update':
          if (status) {
            setStatus({
              ...status,
              stats: lastMessage.data,
            });
          }
          break;
        case 'training_complete':
          fetchStatus();
          break;
        case 'error':
          setError(lastMessage.message || 'An error occurred');
          break;
      }
    }
  }, [lastMessage]);

  const fetchStatus = useCallback(async () => {
    try {
      const statusData = await trainingApi.getStatus();
      setStatus(statusData);
    } catch (err) {
      setError('Failed to fetch training status');
    }
  }, []);

  const startTraining = useCallback(async (config: TrainingConfig) => {
    setLoading(true);
    setError(null);
    try {
      await trainingApi.start(config);
      await fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to start training');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const stopTraining = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await trainingApi.stop();
      await fetchStatus();
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to stop training');
    } finally {
      setLoading(false);
    }
  }, [fetchStatus]);

  const testAgent = useCallback(async (renderVideo: boolean = false) => {
    setLoading(true);
    setError(null);
    try {
      const results = await trainingApi.test(renderVideo);
      setTestResults(results);
      return results;
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to test agent');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    status,
    testResults,
    error,
    loading,
    startTraining,
    stopTraining,
    testAgent,
    fetchStatus,
  };
};
