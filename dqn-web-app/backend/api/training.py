"""
Training Manager for DQN Web App
Handles training coordination and management
"""
import gymnasium as gym
import numpy as np
import asyncio
import threading
import time
import cv2
import matplotlib.pyplot as plt
import matplotlib.animation as animation
from pathlib import Path
from typing import Optional, Dict, Any, List
import logging
from collections import deque

from core.dqn_agent import DQNAgent, DoubleDQNAgent

logger = logging.getLogger(__name__)

class TrainingManager:
    """Manages DQN training sessions and provides API interface"""

    def __init__(self):
        self.agent: Optional[DQNAgent] = None
        self.env = None
        self.is_training = False
        self.training_thread: Optional[threading.Thread] = None
        self.training_config = {
            'algorithm': 'dqn',  # 'dqn' or 'double_dqn'
            'n_episodes': 1000,
            'max_t': 500,
            'target_score': 475.0,
            'lr': 0.0005,
            'gamma': 0.99,
            'epsilon': 1.0,
            'epsilon_decay': 0.995,
            'epsilon_min': 0.01,
            'buffer_size': 10000,
            'batch_size': 64,
            'update_every': 4,
            'tau': 0.001
        }
        self.models_dir = Path("static/models")
        self.videos_dir = Path("static/videos")
        self.models_dir.mkdir(exist_ok=True)
        self.videos_dir.mkdir(exist_ok=True)

    def create_agent(self, algorithm='dqn'):
        """Create a new DQN agent with current configuration"""
        config = self.training_config

        if algorithm == 'double_dqn':
            self.agent = DoubleDQNAgent(
                state_size=4,
                action_size=2,
                lr=config['lr'],
                gamma=config['gamma'],
                epsilon=config['epsilon'],
                epsilon_decay=config['epsilon_decay'],
                epsilon_min=config['epsilon_min'],
                buffer_size=config['buffer_size'],
                batch_size=config['batch_size'],
                update_every=config['update_every'],
                tau=config['tau']
            )
        else:
            self.agent = DQNAgent(
                state_size=4,
                action_size=2,
                lr=config['lr'],
                gamma=config['gamma'],
                epsilon=config['epsilon'],
                epsilon_decay=config['epsilon_decay'],
                epsilon_min=config['epsilon_min'],
                buffer_size=config['buffer_size'],
                batch_size=config['batch_size'],
                update_every=config['update_every'],
                tau=config['tau']
            )

        logger.info(f"Created {algorithm} agent with config: {config}")

    def update_config(self, new_config: Dict[str, Any]):
        """Update training configuration"""
        self.training_config.update(new_config)
        logger.info(f"Updated training config: {new_config}")

    def start_training(self, algorithm='dqn'):
        """Start training in a separate thread"""
        if self.is_training:
            return {"status": "error", "message": "Training already in progress"}

        try:
            self.create_agent(algorithm)
            self.training_thread = threading.Thread(target=self._train_agent)
            self.training_thread.daemon = True
            self.training_thread.start()

            return {"status": "success", "message": "Training started"}
        except Exception as e:
            logger.error(f"Error starting training: {e}")
            return {"status": "error", "message": str(e)}

    def stop_training(self):
        """Stop current training"""
        if not self.is_training:
            return {"status": "error", "message": "No training in progress"}

        self.is_training = False
        if self.training_thread:
            self.training_thread.join(timeout=5)

        return {"status": "success", "message": "Training stopped"}

    def _train_agent(self):
        """Internal training loop"""
        if not self.agent:
            logger.error("No agent created")
            return

        self.env = gym.make("CartPole-v1")
        self.is_training = True
        self.agent.training_metrics['is_training'] = True

        config = self.training_config
        scores_window = deque(maxlen=100)

        logger.info(f"Starting training for {config['n_episodes']} episodes")

        try:
            for episode in range(1, config['n_episodes'] + 1):
                if not self.is_training:
                    break

                state, _ = self.env.reset()
                score = 0
                episode_losses = []

                for t in range(config['max_t']):
                    if not self.is_training:
                        break

                    action = self.agent.act(state, training=True)
                    next_state, reward, done, truncated, _ = self.env.step(action)

                    loss = self.agent.step(state, action, reward, next_state, done or truncated)
                    if loss > 0:
                        episode_losses.append(loss)

                    state = next_state
                    score += reward
                    self.agent.training_metrics['step'] += 1

                    if done or truncated:
                        break

                # Update metrics
                scores_window.append(score)
                self.agent.training_metrics['scores'].append(score)
                self.agent.training_metrics['epsilons'].append(self.agent.epsilon)
                self.agent.training_metrics['episode'] = episode

                if episode_losses:
                    avg_loss = np.mean(episode_losses)
                    self.agent.training_metrics['losses'].append(avg_loss)
                else:
                    self.agent.training_metrics['losses'].append(0)

                # Check if solved
                if len(scores_window) >= 100 and np.mean(scores_window) >= config['target_score']:
                    self.agent.training_metrics['is_solved'] = True
                    logger.info(f"Environment solved in {episode-100} episodes!")
                    self.save_model(f"solved_model_episode_{episode}.pth")
                    break

                # Save model periodically
                if episode % 100 == 0:
                    self.save_model(f"checkpoint_episode_{episode}.pth")
                    logger.info(f"Episode {episode}: Average Score: {np.mean(scores_window):.2f}")

        except Exception as e:
            logger.error(f"Training error: {e}")
        finally:
            self.is_training = False
            if self.agent:
                self.agent.training_metrics['is_training'] = False
            if self.env:
                self.env.close()
            logger.info("Training completed")

    def get_training_status(self):
        """Get current training status and metrics"""
        if not self.agent:
            return {
                "is_training": False,
                "agent_created": False,
                "metrics": {}
            }

        return {
            "is_training": self.is_training,
            "agent_created": True,
            "metrics": self.agent.get_metrics(),
            "config": self.training_config
        }

    def save_model(self, filename):
        """Save the current model"""
        if not self.agent:
            return {"status": "error", "message": "No agent to save"}

        filepath = self.models_dir / filename
        try:
            self.agent.save_model(filepath)
            return {"status": "success", "filepath": str(filepath)}
        except Exception as e:
            logger.error(f"Error saving model: {e}")
            return {"status": "error", "message": str(e)}

    def load_model(self, filename):
        """Load a saved model"""
        filepath = self.models_dir / filename
        if not filepath.exists():
            return {"status": "error", "message": "Model file not found"}

        try:
            if not self.agent:
                self.create_agent()

            self.agent.load_model(filepath)
            return {"status": "success", "message": "Model loaded successfully"}
        except Exception as e:
            logger.error(f"Error loading model: {e}")
            return {"status": "error", "message": str(e)}

    def generate_test_video(self, filename="cartpole_test.mp4"):
        """Generate a video of the trained agent playing CartPole"""
        if not self.agent:
            return {"status": "error", "message": "No trained agent available"}

        try:
            env = gym.make("CartPole-v1", render_mode="rgb_array")
            frames = []

            state, _ = env.reset()
            done = False
            score = 0

            while not done and len(frames) < 500:  # Max 500 frames
                action = self.agent.act(state, training=False)
                state, reward, done, truncated, _ = env.step(action)
                score += reward

                # Capture frame
                frame = env.render()
                frames.append(frame)

                if truncated:
                    done = True

            env.close()

            # Save video
            if frames:
                video_path = self.videos_dir / filename
                self._save_video(frames, str(video_path))

                return {
                    "status": "success", 
                    "filepath": str(video_path),
                    "score": score,
                    "frames": len(frames)
                }
            else:
                return {"status": "error", "message": "No frames captured"}

        except Exception as e:
            logger.error(f"Error generating video: {e}")
            return {"status": "error", "message": str(e)}

    def _save_video(self, frames, filepath, fps=30):
        """Save frames as video file"""
        if not frames:
            return

        height, width, layers = frames[0].shape
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(filepath, fourcc, fps, (width, height))

        for frame in frames:
            # Convert RGB to BGR for OpenCV
            frame_bgr = cv2.cvtColor(frame, cv2.COLOR_RGB2BGR)
            video_writer.write(frame_bgr)

        video_writer.release()

    def get_available_models(self):
        """Get list of available saved models"""
        models = []
        for model_file in self.models_dir.glob("*.pth"):
            models.append({
                "filename": model_file.name,
                "size": model_file.stat().st_size,
                "modified": model_file.stat().st_mtime
            })
        return models
