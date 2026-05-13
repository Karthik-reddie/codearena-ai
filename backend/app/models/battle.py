import enum
from datetime import datetime, timezone

from sqlalchemy import DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import Mapped, mapped_column

from app.core.database import Base


class BattleStatus(str, enum.Enum):
    WAITING = "waiting"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class Battle(Base):
    __tablename__ = "battles"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    room_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    challenge_id: Mapped[int] = mapped_column(ForeignKey("challenges.id"))
    player1_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    player2_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    winner_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"), nullable=True)
    status: Mapped[BattleStatus] = mapped_column(Enum(BattleStatus), default=BattleStatus.WAITING)
    player1_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    player2_code: Mapped[str | None] = mapped_column(Text, nullable=True)
    player1_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    player2_result: Mapped[dict | None] = mapped_column(JSONB, nullable=True)
    time_limit_seconds: Mapped[int] = mapped_column(Integer, default=600)
    xp_reward: Mapped[int] = mapped_column(Integer, default=50)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=lambda: datetime.now(timezone.utc)
    )
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
