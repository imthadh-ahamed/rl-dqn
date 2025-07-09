'use client';
import React from 'react';
import { useTraining } from './training-provider';

export default function SimulationContent() {
  const { state, startTraining, stopTraining } = useTraining();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          DQN Training Simulation
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Training Controls */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Controls</h2>
              
              <div className="space-y-4">
                <button
                  onClick={startTraining}
                  disabled={state.isLoading}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {state.isLoading ? 'Starting...' : 'Start Training'}
                </button>
                
                <button
                  onClick={stopTraining}
                  disabled={state.isLoading}
                  className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 disabled:opacity-50"
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
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Training Status</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-500">Status</h3>
                  <p className="text-lg font-semibold">
                    {state.isLoading ? 'Loading...' : 'Ready'}
                  </p>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-gray-500">Environment</h3>
                  <p className="text-lg font-semibold">CartPole-v1</p>
                </div>
              </div>
              
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-2">Instructions</h3>
                <ul className="text-sm text-gray-600 space-y-1">
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
  );
}