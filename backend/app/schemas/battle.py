from datetime import datetime

from pydantic import BaseModel

from app.models.battle import BattleStatus


class BattleCreate(BaseModel):
    challenge_id: int
    time_limit_seconds: int = 600


class BattleResponse(BaseModel):
    id: int
    room_code: str
    challenge_id: int
    player1_id: int
    player2_id: int | None
    winner_id: int | None
    status: BattleStatus
    time_limit_seconds: int
    xp_reward: int
    created_at: datetime
    started_at: datetime | None
    ended_at: datetime | None

    model_config = {"from_attributes": True}


class BattleSubmit(BaseModel):
    code: str
    language: str = "python"
