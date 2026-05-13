from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.challenge import Submission, SubmissionStatus
from app.models.user import DailyActivity, User

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("/stats")
async def get_user_stats(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    total_subs = await db.execute(
        select(func.count(Submission.id)).where(Submission.user_id == current_user.id)
    )
    accepted_subs = await db.execute(
        select(func.count(Submission.id)).where(
            Submission.user_id == current_user.id,
            Submission.status == SubmissionStatus.ACCEPTED,
        )
    )

    return {
        "xp": current_user.xp,
        "level": current_user.level,
        "streak_days": current_user.streak_days,
        "problems_solved": current_user.problems_solved,
        "battles_won": current_user.battles_won,
        "battles_played": current_user.battles_played,
        "total_submissions": total_subs.scalar(),
        "accepted_submissions": accepted_subs.scalar(),
        "xp_to_next_level": _xp_to_next_level(current_user.level),
    }


@router.get("/heatmap")
async def get_heatmap(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    one_year_ago = datetime.now(timezone.utc) - timedelta(days=365)
    result = await db.execute(
        select(DailyActivity)
        .where(
            DailyActivity.user_id == current_user.id,
            DailyActivity.date >= one_year_ago,
        )
        .order_by(DailyActivity.date)
    )
    activities = result.scalars().all()
    return [
        {
            "date": a.date.strftime("%Y-%m-%d"),
            "problems_solved": a.problems_solved,
            "xp_earned": a.xp_earned,
            "time_spent_minutes": a.time_spent_minutes,
        }
        for a in activities
    ]


@router.get("/daily-goals")
async def get_daily_goals(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    today = datetime.now(timezone.utc).date()
    result = await db.execute(
        select(DailyActivity).where(
            DailyActivity.user_id == current_user.id,
            func.date(DailyActivity.date) == today,
        )
    )
    activity = result.scalar_one_or_none()

    return {
        "problems_goal": 3,
        "problems_done": activity.problems_solved if activity else 0,
        "xp_goal": 100,
        "xp_earned": activity.xp_earned if activity else 0,
        "time_goal_minutes": 60,
        "time_spent_minutes": activity.time_spent_minutes if activity else 0,
    }


@router.get("/recent-submissions")
async def recent_submissions(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Submission)
        .where(Submission.user_id == current_user.id)
        .order_by(Submission.submitted_at.desc())
        .limit(10)
    )
    subs = result.scalars().all()
    return [
        {
            "id": s.id,
            "challenge_id": s.challenge_id,
            "status": s.status,
            "language": s.language,
            "xp_earned": s.xp_earned,
            "submitted_at": s.submitted_at.isoformat(),
        }
        for s in subs
    ]


def _xp_to_next_level(current_level: int) -> int:
    xp_needed = 100
    for _ in range(1, current_level):
        xp_needed = int(xp_needed * 1.5)
    return xp_needed
