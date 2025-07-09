
export interface TrainingConfig {
  episodes: number;
  learning_rate: number;
  gamma: number;
  epsilon: number;
  epsilon_min: number;
  epsilon_decay: number;
  memory_size: number;
  batch_size: number;
}

export interface TrainingStats {
  episode: number;
  total_episodes: number;
  current_reward: number;
  average_reward: number;
  epsilon: number;
  loss: number;
  episode_rewards: number[];
  losses: number[];
}

export interface TrainingStatus {
  is_training: boolean;
  stats: TrainingStats;
}

export interface Model {
  name: string;
  filename: string;
  size: number;
  created: string;
  modified: string;
}

export interface WebSocketMessage {
  type: 'training_update' | 'training_complete' | 'error';
  data?: any;
  message?: string;
}

export interface TestResults {
  average_reward: number;
  rewards: number[];
  frames?: any[];
}
