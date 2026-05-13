import json
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

from app.api.routes import admin, ai_mentor, auth, battles, challenges, dashboard, leaderboard, notifications, roadmaps
from app.core.config import settings
from app.core.database import Base, engine
from app.core.redis import close_redis
from app.services.seed import seed_database
from app.services.websocket import manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    from app.core.database import async_session_factory

    async with async_session_factory() as session:
        await seed_database(session)
        await session.commit()

    yield

    await close_redis()
    await engine.dispose()


limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="A gamified coding learning platform with AI-assisted challenges",
    lifespan=lifespan,
)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(challenges.router, prefix="/api")
app.include_router(battles.router, prefix="/api")
app.include_router(roadmaps.router, prefix="/api")
app.include_router(leaderboard.router, prefix="/api")
app.include_router(ai_mentor.router, prefix="/api")
app.include_router(notifications.router, prefix="/api")
app.include_router(admin.router, prefix="/api")
app.include_router(dashboard.router, prefix="/api")


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.websocket("/ws/battle/{room_code}")
async def battle_websocket(websocket: WebSocket, room_code: str, user_id: int = 0):
    await manager.connect(websocket, f"battle:{room_code}", user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            message["user_id"] = user_id
            await manager.broadcast(f"battle:{room_code}", message)
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"battle:{room_code}", user_id)
        await manager.broadcast(
            f"battle:{room_code}",
            {"type": "player_left", "user_id": user_id},
        )


@app.websocket("/ws/notifications/{user_id}")
async def notification_websocket(websocket: WebSocket, user_id: int):
    await manager.connect(websocket, f"notifications:{user_id}", user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket, f"notifications:{user_id}", user_id)
