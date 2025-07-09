
from fastapi import APIRouter, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import Dict, Any, Optional
import os

router = APIRouter()

# Import from main module to access training_manager
from main import training_manager

class TrainingConfig(BaseModel):
    episodes: int = 500
    learning_rate: float = 0.001
    gamma: float = 0.95
    epsilon: float = 1.0
    epsilon_min: float = 0.01
    epsilon_decay: float = 0.995
    memory_size: int = 10000
    batch_size: int = 32

@router.post("/training/start")
async def start_training(config: TrainingConfig):
    """Start training with given configuration"""
    if training_manager.is_training:
        raise HTTPException(status_code=400, detail="Training already in progress")

    try:
        # Initialize agent with config
        training_manager.initialize_agent(config.dict())

        # Start training
        success = training_manager.start_training(config.episodes)

        if success:
            return {"message": "Training started successfully", "config": config.dict()}
        else:
            raise HTTPException(status_code=500, detail="Failed to start training")

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/training/stop")
async def stop_training():
    """Stop current training"""
    if not training_manager.is_training:
        raise HTTPException(status_code=400, detail="No training in progress")

    training_manager.stop_training()
    return {"message": "Training stopped successfully"}

@router.get("/training/status")
async def get_training_status():
    """Get current training status and statistics"""
    return training_manager.get_training_status()

@router.post("/training/test")
async def test_agent(render_video: bool = False):
    """Test the trained agent"""
    try:
        results = training_manager.test_agent(render_video=render_video)
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/training/stats")
async def get_training_stats():
    """Get detailed training statistics"""
    stats = training_manager.get_training_status()["stats"]
    return {
        "episode_rewards": stats.get("episode_rewards", []),
        "losses": stats.get("losses", []),
        "current_episode": stats.get("episode", 0),
        "total_episodes": stats.get("total_episodes", 0),
        "average_reward": stats.get("average_reward", 0),
        "epsilon": stats.get("epsilon", 1.0)
    }
