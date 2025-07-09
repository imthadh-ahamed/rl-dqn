
import os
from typing import Dict, Any

class Config:
    # Server configuration
    HOST = os.getenv("HOST", "0.0.0.0")
    PORT = int(os.getenv("PORT", 8000))
    ENVIRONMENT = os.getenv("ENVIRONMENT", "development")

    # Training configuration
    DEFAULT_CONFIG = {
        "episodes": int(os.getenv("MAX_EPISODES", 1000)),
        "learning_rate": float(os.getenv("LEARNING_RATE", 0.001)),
        "batch_size": int(os.getenv("BATCH_SIZE", 32)),
        "memory_size": int(os.getenv("MEMORY_SIZE", 10000)),
        "gamma": 0.95,
        "epsilon": 1.0,
        "epsilon_min": 0.01,
        "epsilon_decay": 0.995
    }

    # Paths
    MODELS_DIR = "models/saved"
    STATIC_DIR = "static"
    VIDEOS_DIR = "static/videos"

    @classmethod
    def ensure_directories(cls):
        """Ensure all required directories exist"""
        for directory in [cls.MODELS_DIR, cls.STATIC_DIR, cls.VIDEOS_DIR]:
            os.makedirs(directory, exist_ok=True)

# Initialize directories on import
Config.ensure_directories()
