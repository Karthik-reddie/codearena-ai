import re

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_admin_user, get_current_user
from app.models.challenge import Challenge, Submission, SubmissionStatus
from app.models.user import User
from app.schemas.challenge import (
    ChallengeCreate,
    ChallengeListResponse,
    ChallengeResponse,
    ChallengeUpdate,
    SubmissionCreate,
    SubmissionResponse,
)

router = APIRouter(prefix="/challenges", tags=["Challenges"])


def slugify(title: str) -> str:
    slug = re.sub(r"[^\w\s-]", "", title.lower())
    return re.sub(r"[-\s]+", "-", slug).strip("-")


@router.get("/", response_model=list[ChallengeListResponse])
async def list_challenges(
    difficulty: str | None = None,
    tag: str | None = None,
    search: str | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
):
    query = select(Challenge).where(Challenge.is_active.is_(True))

    if difficulty:
        query = query.where(Challenge.difficulty == difficulty)
    if tag:
        query = query.where(Challenge.tags.contains([tag]))
    if search:
        query = query.where(Challenge.title.ilike(f"%{search}%"))

    query = query.offset(skip).limit(limit).order_by(Challenge.id)
    result = await db.execute(query)
    return [ChallengeListResponse.model_validate(c) for c in result.scalars().all()]


@router.get("/count")
async def count_challenges(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(func.count(Challenge.id)).where(Challenge.is_active.is_(True))
    )
    return {"count": result.scalar()}


@router.get("/{slug}", response_model=ChallengeResponse)
async def get_challenge(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Challenge).where(Challenge.slug == slug, Challenge.is_active.is_(True))
    )
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    return ChallengeResponse.model_validate(challenge)


@router.post("/", response_model=ChallengeResponse, status_code=status.HTTP_201_CREATED)
async def create_challenge(
    data: ChallengeCreate,
    admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    challenge = Challenge(
        **data.model_dump(),
        slug=slugify(data.title),
        created_by=admin.id,
    )
    db.add(challenge)
    await db.flush()
    await db.refresh(challenge)
    return ChallengeResponse.model_validate(challenge)


@router.put("/{challenge_id}", response_model=ChallengeResponse)
async def update_challenge(
    challenge_id: int,
    data: ChallengeUpdate,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(challenge, field, value)

    if data.title:
        challenge.slug = slugify(data.title)

    await db.flush()
    await db.refresh(challenge)
    return ChallengeResponse.model_validate(challenge)


@router.delete("/{challenge_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_challenge(
    challenge_id: int,
    _admin: User = Depends(get_admin_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")
    challenge.is_active = False
    await db.flush()


@router.post("/submit", response_model=SubmissionResponse)
async def submit_solution(
    data: SubmissionCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == data.challenge_id))
    challenge = result.scalar_one_or_none()
    if not challenge:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    test_results = _run_tests(data.code, challenge.test_cases or [])
    all_passed = all(r["passed"] for r in test_results)

    sub_status = SubmissionStatus.ACCEPTED if all_passed else SubmissionStatus.WRONG_ANSWER
    xp_earned = challenge.xp_reward if all_passed else 0

    submission = Submission(
        user_id=current_user.id,
        challenge_id=data.challenge_id,
        code=data.code,
        language=data.language,
        status=sub_status,
        test_results={"results": test_results},
        xp_earned=xp_earned,
    )
    db.add(submission)

    if all_passed:
        current_user.xp += xp_earned
        current_user.problems_solved += 1
        current_user.level = _calculate_level(current_user.xp)

    await db.flush()
    await db.refresh(submission)
    return SubmissionResponse.model_validate(submission)


@router.get("/submissions/history", response_model=list[SubmissionResponse])
async def get_submissions(
    challenge_id: int | None = None,
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    query = select(Submission).where(Submission.user_id == current_user.id)
    if challenge_id:
        query = query.where(Submission.challenge_id == challenge_id)
    query = query.order_by(Submission.submitted_at.desc()).offset(skip).limit(limit)
    result = await db.execute(query)
    return [SubmissionResponse.model_validate(s) for s in result.scalars().all()]


def _run_tests(code: str, test_cases: list[dict]) -> list[dict]:
    results = []
    for i, tc in enumerate(test_cases):
        try:
            local_ns: dict = {}
            exec(code, {"__builtins__": {}}, local_ns)  # noqa: S102
            func_name = next((k for k, v in local_ns.items() if callable(v)), None)
            if func_name:
                func = local_ns[func_name]
                actual = func(*tc.get("input", []))
                passed = actual == tc.get("expected")
            else:
                passed = False
                actual = None
            results.append({
                "test_case": i + 1,
                "passed": passed,
                "expected": tc.get("expected"),
                "actual": actual,
            })
        except Exception as e:
            results.append({
                "test_case": i + 1,
                "passed": False,
                "error": str(e),
            })
    return results


def _calculate_level(xp: int) -> int:
    level = 1
    xp_needed = 100
    while xp >= xp_needed:
        xp -= xp_needed
        level += 1
        xp_needed = int(xp_needed * 1.5)
    return level
