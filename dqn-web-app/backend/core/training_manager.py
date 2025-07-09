
import gymnasium as gym
import numpy as np
import asyncio
import threading
import time
from typing import Dict, Any, Optional, Callable
from .dqn_agent import DQNAgent
import cv2

class TrainingManager:
    def __init__(self):
        self.agent = None
        self.env = None
        self.is_training = False
        self.training_thread = None
        self.training_stats = {
            "episode": 0,
            "total_episodes": 0,
            "current_reward": 0,
            "average_reward": 0,
            "epsilon": 1.0,
            "loss": 0,
            "episode_rewards": [],
            "losses": []
        }
        self.callbacks = []

    def initialize_agent(self, config: Dict[str, Any]):
        """Initialize DQN agent with given configuration"""
        self.env = gym.make("CartPole-v1", render_mode="rgb_array")
        state, _ = self.env.reset()

        self.agent = DQNAgent(
            state_size=len(state),
            action_size=self.env.action_space.n,
            lr=config.get("learning_rate", 0.001),
            gamma=config.get("gamma", 0.95),
            epsilon=config.get("epsilon", 1.0),
            epsilon_min=config.get("epsilon_min", 0.01),
            epsilon_decay=config.get("epsilon_decay", 0.995),
            memory_size=config.get("memory_size", 10000),
            batch_size=config.get("batch_size", 32)
        )

    def add_callback(self, callback: Callable):
        """Add callback function for training updates"""
        self.callbacks.append(callback)

    def notify_callbacks(self):
        """Notify all callbacks with current training stats"""
        for callback in self.callbacks:
            try:
                callback(self.training_stats.copy())
            except Exception as e:
                print(f"Callback error: {e}")

    def start_training(self, episodes: int):
        """Start training in a separate thread"""
        if self.is_training:
            return False

        self.is_training = True
        self.training_stats["total_episodes"] = episodes
        self.training_thread = threading.Thread(
            target=self._training_loop, 
            args=(episodes,)
        )
        self.training_thread.start()
        return True

    def stop_training(self):
        """Stop the training process"""
        self.is_training = False
        if self.training_thread:
            self.training_thread.join()

    def _training_loop(self, episodes: int):
        """Main training loop"""
        for episode in range(episodes):
            if not self.is_training:
                break

            state, _ = self.env.reset()
            total_reward = 0
            step = 0

            while True:
                action = self.agent.act(state)
                next_state, reward, terminated, truncated, _ = self.env.step(action)
                done = terminated or truncated

                self.agent.remember(state, action, reward, next_state, done)
                state = next_state
                total_reward += reward
                step += 1

                if done:
                    break

            # Train the agent
            loss = self.agent.replay()

            # Update target network every 100 episodes
            if episode % 100 == 0:
                self.agent.update_target_network()

            # Update statistics
            self.training_stats["episode"] = episode + 1
            self.training_stats["current_reward"] = total_reward
            self.training_stats["epsilon"] = self.agent.epsilon
            self.training_stats["episode_rewards"].append(total_reward)

            if loss is not None:
                self.training_stats["loss"] = loss
                self.training_stats["losses"].append(loss)

            # Calculate average reward over last 100 episodes
            recent_rewards = self.training_stats["episode_rewards"][-100:]
            self.training_stats["average_reward"] = np.mean(recent_rewards)

            # Notify callbacks
            self.notify_callbacks()

            # Small delay to prevent overwhelming the system
            time.sleep(0.01)

    def get_training_status(self) -> Dict[str, Any]:
        """Get current training status"""
        return {
            "is_training": self.is_training,
            "stats": self.training_stats.copy()
        }

    def test_agent(self, render_video: bool = False) -> Dict[str, Any]:
        """Test the trained agent"""
        if not self.agent:
            return {"error": "No trained agent available"}

        total_rewards = []
        frames = []

        for _ in range(5):  # Test 5 episodes
            state, _ = self.env.reset()
            total_reward = 0
            episode_frames = []

            while True:
                if render_video:
                    frame = self.env.render()
                    episode_frames.append(frame)

                action = self.agent.act(state)
                state, reward, terminated, truncated, _ = self.env.step(action)
                total_reward += reward

                if terminated or truncated:
                    break

            total_rewards.append(total_reward)
            if render_video and episode_frames:
                frames.extend(episode_frames)

        return {
            "average_reward": np.mean(total_rewards),
            "rewards": total_rewards,
            "frames": frames if render_video else None
        }

    def save_model(self, name: str) -> str:
        """Save the trained model"""
        if not self.agent:
            raise ValueError("No agent to save")

        filepath = f"models/saved/{name}.pth"
        self.agent.save_model(filepath)
        return filepath

    def load_model(self, filepath: str):
        """Load a trained model"""
        if not self.agent:
            raise ValueError("Agent not initialized")

        self.agent.load_model(filepath)
