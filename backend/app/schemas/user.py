from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.user import UserRole


class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(default="", max_length=100)


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    username: str
    email: str
    full_name: str
    avatar_url: str | None
    role: UserRole
    xp: int
    level: int
    streak_days: int
    problems_solved: int
    battles_won: int
    battles_played: int
    bio: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    full_name: str | None = None
    bio: str | None = None
    avatar_url: str | None = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str = Field(..., min_length=8)


class GoogleAuthRequest(BaseModel):
    token: str


class LeaderboardEntry(BaseModel):
    rank: int
    user_id: int
    username: str
    avatar_url: str | None
    xp: int
    level: int
    problems_solved: int
    battles_won: int

    model_config = {"from_attributes": True}
