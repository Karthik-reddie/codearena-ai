from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.roadmap import Roadmap, UserRoadmapProgress
from app.models.user import User
from app.schemas.roadmap import RoadmapProgressResponse, RoadmapResponse, UpdateProgressRequest

router = APIRouter(prefix="/roadmaps", tags=["Roadmaps"])


@router.get("/", response_model=list[RoadmapResponse])
async def list_roadmaps(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Roadmap).order_by(Roadmap.id))
    return [RoadmapResponse.model_validate(r) for r in result.scalars().all()]


@router.get("/{slug}", response_model=RoadmapResponse)
async def get_roadmap(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Roadmap).where(Roadmap.slug == slug))
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")
    return RoadmapResponse.model_validate(roadmap)


@router.get("/{slug}/progress", response_model=RoadmapProgressResponse)
async def get_progress(
    slug: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Roadmap).where(Roadmap.slug == slug))
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")

    progress_result = await db.execute(
        select(UserRoadmapProgress).where(
            UserRoadmapProgress.user_id == current_user.id,
            UserRoadmapProgress.roadmap_id == roadmap.id,
        )
    )
    progress = progress_result.scalar_one_or_none()

    if not progress:
        progress = UserRoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap.id,
            completed_topics=[],
            percentage=0,
        )
        db.add(progress)
        await db.flush()
        await db.refresh(progress)

    return RoadmapProgressResponse(
        roadmap=RoadmapResponse.model_validate(roadmap),
        completed_topics=progress.completed_topics or [],
        percentage=progress.percentage,
    )


@router.post("/{slug}/progress")
async def update_progress(
    slug: str,
    data: UpdateProgressRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Roadmap).where(Roadmap.slug == slug))
    roadmap = result.scalar_one_or_none()
    if not roadmap:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Roadmap not found")

    progress_result = await db.execute(
        select(UserRoadmapProgress).where(
            UserRoadmapProgress.user_id == current_user.id,
            UserRoadmapProgress.roadmap_id == roadmap.id,
        )
    )
    progress = progress_result.scalar_one_or_none()

    if not progress:
        progress = UserRoadmapProgress(
            user_id=current_user.id,
            roadmap_id=roadmap.id,
            completed_topics=[],
        )
        db.add(progress)

    topics = list(progress.completed_topics or [])
    if data.completed and data.topic_id not in topics:
        topics.append(data.topic_id)
    elif not data.completed and data.topic_id in topics:
        topics.remove(data.topic_id)

    progress.completed_topics = topics
    total = roadmap.total_topics or 1
    progress.percentage = int(len(topics) / total * 100)

    await db.flush()

    return {"completed_topics": topics, "percentage": progress.percentage}
