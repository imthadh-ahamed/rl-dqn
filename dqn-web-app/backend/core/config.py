"""
Configuration settings for the DQN training API
"""
from pydantic import BaseSettings
from typing import List
import os

class Settings(BaseSettings):
    """Application settings"""

    # API Settings
    api_host: str = "localhost"
    api_port: int = 8000
    cors_origins: List[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Training Settings
    max_episodes: int = 1000
    target_score: float = 475.0
    save_every: int = 100

    # File Paths
    models_dir: str = "static/models"
    videos_dir: str = "static/videos"

    # Logging
    log_level: str = "INFO"

    class Config:
        env_file = ".env"

settings = Settings()
