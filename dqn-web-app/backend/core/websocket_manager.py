
import asyncio
import json
from typing import Set, Dict, Any
from fastapi import WebSocket

class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            self.disconnect(websocket)

    async def broadcast(self, message: Dict[str, Any]):
        if not self.active_connections:
            return

        message_text = json.dumps(message)
        disconnected = set()

        for connection in self.active_connections.copy():
            try:
                await connection.send_text(message_text)
            except:
                disconnected.add(connection)

        # Remove disconnected connections
        for connection in disconnected:
            self.disconnect(connection)

    async def broadcast_training_update(self, stats: Dict[str, Any]):
        await self.broadcast({
            "type": "training_update",
            "data": stats
        })

    async def broadcast_training_complete(self):
        await self.broadcast({
            "type": "training_complete",
            "message": "Training completed successfully"
        })

    async def broadcast_error(self, error: str):
        await self.broadcast({
            "type": "error",
            "message": error
        })

# Global WebSocket manager instance
websocket_manager = WebSocketManager()
