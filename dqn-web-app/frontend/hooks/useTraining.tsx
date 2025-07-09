import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { TrainingMetrics, TrainingConfig, TrainingStatus, WebSocketMessage } from '@/types';
import { apiClient } from '@/lib/api';
import { useWebSocket } from './useWebSocket';

interface TrainingState {
  status: TrainingStatus | null;
  isLoading: boolean;
  error: string | null;
  lastUpdate: number;
}

type TrainingAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_STATUS'; payload: TrainingStatus }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_METRICS'; payload: TrainingMetrics }
  | { type: 'SET_LAST_UPDATE'; payload: number };

const initialState: TrainingState = {
  status: null,
  isLoading: false,
  error: null,
  lastUpdate: 0,
};

function trainingReducer(state: TrainingState, action: TrainingAction): TrainingState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_STATUS':
      return { ...state, status: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isLoading: false };
    case 'UPDATE_METRICS':
      return {
        ...state,
        status: state.status ? { ...state.status, metrics: action.payload } : null,
      };
    case 'SET_LAST_UPDATE':
      return { ...state, lastUpdate: action.payload };
    default:
      return state;
  }
}

interface TrainingContextType {
  state: TrainingState;
  startTraining: (algorithm?: string, config?: any) => Promise<void>;
  stopTraining: () => Promise<void>;
  updateConfig: (config: any) => Promise<void>;
  refreshStatus: () => Promise<void>;
  saveModel: (filename?: string) => Promise<void>;
  loadModel: (filename: string) => Promise<void>;
  generateVideo: (filename?: string) => Promise<void>;
}

const TrainingContext = createContext<TrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(trainingReducer, initialState);

  const handleWebSocketMessage = (message: WebSocketMessage) => {
    dispatch({ type: 'SET_LAST_UPDATE', payload: Date.now() });

    switch (message.type) {
      case 'training_update':
        if (message.data) {
          dispatch({ type: 'UPDATE_METRICS', payload: message.data });
        }
        break;
      case 'training_started':
        refreshStatus();
        break;
      case 'training_stopped':
      case 'training_complete':
        refreshStatus();
        break;
      case 'error':
        dispatch({ type: 'SET_ERROR', payload: message.message || 'Unknown error' });
        break;
    }
  };

  const { isConnected } = useWebSocket({
    url: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
    onMessage: handleWebSocketMessage,
    onError: (error) => console.error('WebSocket error:', error),
  });

  const startTraining = async (algorithm = 'dqn', config?: any) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.startTraining(algorithm, config);
      await refreshStatus();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to start training' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const stopTraining = async () => {
    dispatch({ type: 'SET_LOADING', payload: true });
    try {
      await apiClient.stopTraining();
      await refreshStatus();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to stop training' });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const updateConfig = async (config: any) => {
    try {
      await apiClient.updateConfig(config);
      await refreshStatus();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to update config' });
    }
  };

  const refreshStatus = async () => {
    try {
      const status = await apiClient.getTrainingStatus();
      dispatch({ type: 'SET_STATUS', payload: status });
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to refresh status' });
    }
  };

  const saveModel = async (filename?: string) => {
    try {
      await apiClient.saveModel(filename);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to save model' });
    }
  };

  const loadModel = async (filename: string) => {
    try {
      await apiClient.loadModel(filename);
      await refreshStatus();
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to load model' });
    }
  };

  const generateVideo = async (filename?: string) => {
    try {
      await apiClient.generateVideo(filename);
    } catch (error) {
      dispatch({ type: 'SET_ERROR', payload: error instanceof Error ? error.message : 'Failed to generate video' });
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const contextValue: TrainingContextType = {
    state,
    startTraining,
    stopTraining,
    updateConfig,
    refreshStatus,
    saveModel,
    loadModel,
    generateVideo,
  };

  return (
    <TrainingContext.Provider value={contextValue}>
      {children}
    </TrainingContext.Provider>
  );
}

export function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}
