from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.models.user import User
from app.schemas.user import LeaderboardEntry

router = APIRouter(prefix="/leaderboard", tags=["Leaderboard"])


@router.get("/global", response_model=list[LeaderboardEntry])
async def global_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.is_active.is_(True))
        .order_by(User.xp.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return [
        LeaderboardEntry(
            rank=skip + i + 1,
            user_id=u.id,
            username=u.username,
            avatar_url=u.avatar_url,
            xp=u.xp,
            level=u.level,
            problems_solved=u.problems_solved,
            battles_won=u.battles_won,
        )
        for i, u in enumerate(users)
    ]


@router.get("/weekly", response_model=list[LeaderboardEntry])
async def weekly_leaderboard(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(User)
        .where(User.is_active.is_(True))
        .order_by(User.xp.desc())
        .offset(skip)
        .limit(limit)
    )
    users = result.scalars().all()
    return [
        LeaderboardEntry(
            rank=skip + i + 1,
            user_id=u.id,
            username=u.username,
            avatar_url=u.avatar_url,
            xp=u.xp,
            level=u.level,
            problems_solved=u.problems_solved,
            battles_won=u.battles_won,
        )
        for i, u in enumerate(users)
    ]
