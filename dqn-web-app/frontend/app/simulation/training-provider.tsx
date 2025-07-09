'use client';

import React, { createContext, useContext, useState, ReactNode, useMemo } from 'react';

interface SimpleTrainingState {
  isLoading: boolean;
  error: string | null;
}

interface SimpleTrainingContextType {
  state: SimpleTrainingState;
  startTraining: () => Promise<void>;
  stopTraining: () => Promise<void>;
}

const TrainingContext = createContext<SimpleTrainingContextType | undefined>(undefined);

export function TrainingProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SimpleTrainingState>({
    isLoading: false,
    error: null,
  });

  const startTraining = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/training/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ episodes: 500 }),
      });
      if (!response.ok) throw new Error('Failed to start training');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to start training' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const stopTraining = async () => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const response = await fetch('/api/training/stop', { method: 'POST' });
      if (!response.ok) throw new Error('Failed to stop training');
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to stop training' 
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const contextValue: SimpleTrainingContextType = useMemo(() => ({
    state,
    startTraining,
    stopTraining,
  }), [state]);

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
