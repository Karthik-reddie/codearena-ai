from datetime import datetime

from pydantic import BaseModel, Field

from app.models.challenge import Difficulty, SubmissionStatus


class ChallengeCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: str
    difficulty: Difficulty
    tags: list[str] = []
    constraints: str | None = None
    examples: list[dict] = []
    test_cases: list[dict] = []
    starter_code: dict = {}
    solution: str | None = None
    hints: list[str] = []
    xp_reward: int = 10
    time_limit_seconds: int = 300


class ChallengeUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    difficulty: Difficulty | None = None
    tags: list[str] | None = None
    constraints: str | None = None
    examples: list[dict] | None = None
    test_cases: list[dict] | None = None
    starter_code: dict | None = None
    solution: str | None = None
    hints: list[str] | None = None
    xp_reward: int | None = None
    time_limit_seconds: int | None = None
    is_active: bool | None = None


class ChallengeResponse(BaseModel):
    id: int
    title: str
    slug: str
    description: str
    difficulty: Difficulty
    tags: list
    constraints: str | None
    examples: list
    starter_code: dict
    hints: list
    xp_reward: int
    time_limit_seconds: int
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class ChallengeListResponse(BaseModel):
    id: int
    title: str
    slug: str
    difficulty: Difficulty
    tags: list
    xp_reward: int
    is_active: bool

    model_config = {"from_attributes": True}


class SubmissionCreate(BaseModel):
    challenge_id: int
    code: str
    language: str = "python"


class SubmissionResponse(BaseModel):
    id: int
    user_id: int
    challenge_id: int
    code: str
    language: str
    status: SubmissionStatus
    test_results: dict | None
    execution_time_ms: int | None
    memory_used_kb: int | None
    xp_earned: int
    submitted_at: datetime

    model_config = {"from_attributes": True}
