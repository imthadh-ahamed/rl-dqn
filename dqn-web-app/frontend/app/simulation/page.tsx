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

function TrainingProvider({ children }: { children: ReactNode }) {
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

function useTraining() {
  const context = useContext(TrainingContext);
  if (context === undefined) {
    throw new Error('useTraining must be used within a TrainingProvider');
  }
  return context;
}

function SimulationContent() {
  const { state, startTraining, stopTraining } = useTraining();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            DQN Training Simulation
          </h1>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Training Controls */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-md p-6 border">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Training Controls</h2>
                
                <div className="space-y-4">
                  <button
                    onClick={startTraining}
                    disabled={state.isLoading}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
                  >
                    {state.isLoading ? 'Starting...' : 'Start Training'}
                  </button>
                  
                  <button
                    onClick={stopTraining}
                    disabled={state.isLoading}
                    className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50 font-medium"
                  >
                    Stop Training
                  </button>
                </div>
                
                {state.error && (
                  <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {state.error}
                  </div>
                )}
              </div>
            </div>
            
            {/* Status Panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-md p-6 border">
                <h2 className="text-xl font-semibold mb-4 text-gray-800">Training Status</h2>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-600">Status</h3>
                    <p className="text-lg font-semibold text-gray-800">
                      {state.isLoading ? 'Loading...' : 'Ready'}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <h3 className="font-medium text-gray-600">Environment</h3>
                    <p className="text-lg font-semibold text-gray-800">CartPole-v1</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>• Click "Start Training" to begin DQN training</li>
                    <li>• The agent will learn to balance a pole on a cart</li>
                    <li>• Training progress will be displayed in real-time</li>
                    <li>• Click "Stop Training" to halt the process</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SimulationPage() {
  return (
    <TrainingProvider>
      <SimulationContent />
    </TrainingProvider>
  );
}
