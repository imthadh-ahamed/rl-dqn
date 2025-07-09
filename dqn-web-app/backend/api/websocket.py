"""
WebSocket connection manager for real-time updates
"""
from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict, Any
import json
import asyncio
import logging

logger = logging.getLogger(__name__)

class ConnectionManager:
    """Manages WebSocket connections for real-time updates"""

    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.update_interval = 1.0  # seconds
        self.is_broadcasting = False

    async def connect(self, websocket: WebSocket):
        """Accept a new WebSocket connection"""
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WebSocket connection. Total: {len(self.active_connections)}")

        # Start broadcasting if first connection
        if len(self.active_connections) == 1 and not self.is_broadcasting:
            asyncio.create_task(self.broadcast_updates())

    def disconnect(self, websocket: WebSocket):
        """Remove a WebSocket connection"""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        logger.info(f"WebSocket disconnected. Remaining: {len(self.active_connections)}")

    async def send_personal_message(self, message: Dict[str, Any], websocket: WebSocket):
        """Send message to a specific WebSocket"""
        try:
            await websocket.send_text(json.dumps(message))
        except Exception as e:
            logger.error(f"Error sending personal message: {e}")
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        """Broadcast message to all connected WebSockets"""
        if not self.active_connections:
            return

        message_str = json.dumps(message)
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_text(message_str)
            except Exception as e:
                logger.error(f"Error broadcasting to connection: {e}")
                disconnected.append(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_updates(self):
        """Continuously broadcast training updates"""
        self.is_broadcasting = True

        while self.active_connections:
            try:
                # Import here to avoid circular imports
                from api.training import TrainingManager

                # Get training status (this would be injected in real app)
                # For now, we'll send a heartbeat
                message = {
                    "type": "heartbeat",
                    "timestamp": asyncio.get_event_loop().time(),
                    "connections": len(self.active_connections)
                }

                await self.broadcast(message)
                await asyncio.sleep(self.update_interval)

            except Exception as e:
                logger.error(f"Error in broadcast loop: {e}")
                await asyncio.sleep(1)

        self.is_broadcasting = False
        logger.info("Stopped broadcasting - no active connections")

    async def send_training_update(self, metrics: Dict[str, Any]):
        """Send training metrics update to all connections"""
        message = {
            "type": "training_update",
            "data": metrics,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.broadcast(message)

    async def send_training_complete(self, final_metrics: Dict[str, Any]):
        """Send training completion notification"""
        message = {
            "type": "training_complete",
            "data": final_metrics,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.broadcast(message)

    async def send_error(self, error_message: str):
        """Send error notification to all connections"""
        message = {
            "type": "error",
            "message": error_message,
            "timestamp": asyncio.get_event_loop().time()
        }
        await self.broadcast(message)
