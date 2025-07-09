
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn
import asyncio
from typing import Dict, Any, Optional
import os
import json
from datetime import datetime

from core.training_manager import TrainingManager
from core.websocket_manager import websocket_manager

# Initialize FastAPI app
app = FastAPI(
    title="DQN Training API",
    description="API for training and managing Deep Q-Network agents",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Global training manager
training_manager = TrainingManager()

# Import and include routers after training_manager is defined
from api.endpoints import training, models
app.include_router(training.router, prefix="/api", tags=["training"])
app.include_router(models.router, prefix="/api", tags=["models"])

@app.get("/")
async def root():
    return {
        "message": "DQN Training API", 
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        websocket_manager.disconnect(websocket)

# Set up training callbacks
def training_callback(stats: Dict[str, Any]):
    """Callback function for training updates"""
    asyncio.create_task(websocket_manager.broadcast_training_update(stats))

training_manager.add_callback(training_callback)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
