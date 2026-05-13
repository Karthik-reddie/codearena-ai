import json
from collections import defaultdict

from fastapi import WebSocket


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = defaultdict(list)
        self.user_connections: dict[int, WebSocket] = {}

    async def connect(self, websocket: WebSocket, room: str, user_id: int | None = None):
        await websocket.accept()
        self.active_connections[room].append(websocket)
        if user_id:
            self.user_connections[user_id] = websocket

    def disconnect(self, websocket: WebSocket, room: str, user_id: int | None = None):
        if websocket in self.active_connections[room]:
            self.active_connections[room].remove(websocket)
        if user_id and user_id in self.user_connections:
            del self.user_connections[user_id]

    async def broadcast(self, room: str, message: dict):
        data = json.dumps(message)
        disconnected = []
        for connection in self.active_connections[room]:
            try:
                await connection.send_text(data)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.active_connections[room].remove(conn)

    async def send_to_user(self, user_id: int, message: dict):
        ws = self.user_connections.get(user_id)
        if ws:
            try:
                await ws.send_text(json.dumps(message))
            except Exception:
                del self.user_connections[user_id]


manager = ConnectionManager()
