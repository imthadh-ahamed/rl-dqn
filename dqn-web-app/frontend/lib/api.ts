
import axios from 'axios';
import { TrainingConfig, TrainingStatus, Model, TestResults } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Training API
export const trainingApi = {
  start: async (config: TrainingConfig) => {
    const response = await api.post('/api/training/start', config);
    return response.data;
  },

  stop: async () => {
    const response = await api.post('/api/training/stop');
    return response.data;
  },

  getStatus: async (): Promise<TrainingStatus> => {
    const response = await api.get('/api/training/status');
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/api/training/stats');
    return response.data;
  },

  test: async (renderVideo: boolean = false): Promise<TestResults> => {
    const response = await api.post(`/api/training/test?render_video=${renderVideo}`);
    return response.data;
  },
};

// Models API
export const modelsApi = {
  list: async (): Promise<{ models: Model[] }> => {
    const response = await api.get('/api/models');
    return response.data;
  },

  save: async (name: string) => {
    const response = await api.post(`/api/models/save?name=${name}`);
    return response.data;
  },

  load: async (filename: string) => {
    const response = await api.post(`/api/models/load?filename=${filename}`);
    return response.data;
  },

  delete: async (filename: string) => {
    const response = await api.delete(`/api/models/${filename}`);
    return response.data;
  },

  download: (filename: string) => {
    return `${API_BASE_URL}/api/models/download/${filename}`;
  },
};
