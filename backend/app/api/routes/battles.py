import secrets
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.battle import Battle, BattleStatus
from app.models.challenge import Challenge
from app.models.user import User
from app.schemas.battle import BattleCreate, BattleResponse, BattleSubmit

router = APIRouter(prefix="/battles", tags=["Battles"])


@router.post("/create", response_model=BattleResponse, status_code=status.HTTP_201_CREATED)
async def create_battle(
    data: BattleCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(select(Challenge).where(Challenge.id == data.challenge_id))
    if not result.scalar_one_or_none():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Challenge not found")

    battle = Battle(
        room_code=secrets.token_urlsafe(8),
        challenge_id=data.challenge_id,
        player1_id=current_user.id,
        time_limit_seconds=data.time_limit_seconds,
    )
    db.add(battle)
    await db.flush()
    await db.refresh(battle)
    return BattleResponse.model_validate(battle)


@router.post("/join/{room_code}", response_model=BattleResponse)
async def join_battle(
    room_code: str,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Battle).where(Battle.room_code == room_code, Battle.status == BattleStatus.WAITING)
    )
    battle = result.scalar_one_or_none()
    if not battle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Battle not found or already started")

    if battle.player1_id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot join your own battle")

    battle.player2_id = current_user.id
    battle.status = BattleStatus.IN_PROGRESS
    battle.started_at = datetime.now(timezone.utc)
    await db.flush()
    await db.refresh(battle)
    return BattleResponse.model_validate(battle)


@router.post("/submit/{room_code}", response_model=BattleResponse)
async def submit_battle(
    room_code: str,
    data: BattleSubmit,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Battle).where(
            Battle.room_code == room_code,
            Battle.status == BattleStatus.IN_PROGRESS,
        )
    )
    battle = result.scalar_one_or_none()
    if not battle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Active battle not found")

    challenge_result = await db.execute(select(Challenge).where(Challenge.id == battle.challenge_id))
    challenge = challenge_result.scalar_one_or_none()

    test_results = _evaluate_code(data.code, challenge.test_cases or [])

    if current_user.id == battle.player1_id:
        battle.player1_code = data.code
        battle.player1_result = test_results
    elif current_user.id == battle.player2_id:
        battle.player2_code = data.code
        battle.player2_result = test_results
    else:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not a participant")

    if battle.player1_result and battle.player2_result:
        p1_score = sum(1 for r in battle.player1_result.get("results", []) if r.get("passed"))
        p2_score = sum(1 for r in battle.player2_result.get("results", []) if r.get("passed"))

        if p1_score > p2_score:
            battle.winner_id = battle.player1_id
        elif p2_score > p1_score:
            battle.winner_id = battle.player2_id

        battle.status = BattleStatus.COMPLETED
        battle.ended_at = datetime.now(timezone.utc)

        if battle.winner_id:
            winner_result = await db.execute(select(User).where(User.id == battle.winner_id))
            winner = winner_result.scalar_one_or_none()
            if winner:
                winner.xp += battle.xp_reward
                winner.battles_won += 1

        for pid in [battle.player1_id, battle.player2_id]:
            if pid:
                p_result = await db.execute(select(User).where(User.id == pid))
                player = p_result.scalar_one_or_none()
                if player:
                    player.battles_played += 1

    await db.flush()
    await db.refresh(battle)
    return BattleResponse.model_validate(battle)


@router.get("/active", response_model=list[BattleResponse])
async def list_active_battles(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Battle).where(Battle.status == BattleStatus.WAITING).limit(20)
    )
    return [BattleResponse.model_validate(b) for b in result.scalars().all()]


@router.get("/{room_code}", response_model=BattleResponse)
async def get_battle(room_code: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Battle).where(Battle.room_code == room_code))
    battle = result.scalar_one_or_none()
    if not battle:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Battle not found")
    return BattleResponse.model_validate(battle)


def _evaluate_code(code: str, test_cases: list[dict]) -> dict:
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
            results.append({"test_case": i + 1, "passed": passed, "actual": actual})
        except Exception as e:
            results.append({"test_case": i + 1, "passed": False, "error": str(e)})
    return {"results": results}
