import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.challenge import Challenge


@pytest.mark.asyncio
async def test_list_challenges(client: AsyncClient):
    response = await client.get("/api/challenges/")
    assert response.status_code == 200
    assert isinstance(response.json(), list)


@pytest.mark.asyncio
async def test_create_challenge_as_admin(client: AsyncClient, admin_headers, db_session):
    response = await client.post(
        "/api/challenges/",
        headers=admin_headers,
        json={
            "title": "Test Challenge",
            "description": "A test challenge",
            "difficulty": "easy",
            "tags": ["test"],
            "xp_reward": 15,
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Challenge"
    assert data["slug"] == "test-challenge"


@pytest.mark.asyncio
async def test_create_challenge_unauthorized(client: AsyncClient, auth_headers):
    response = await client.post(
        "/api/challenges/",
        headers=auth_headers,
        json={
            "title": "Test Challenge",
            "description": "A test challenge",
            "difficulty": "easy",
        },
    )
    assert response.status_code == 403


@pytest.mark.asyncio
async def test_get_challenge(client: AsyncClient, db_session: AsyncSession):
    challenge = Challenge(
        title="Find Challenge",
        slug="find-challenge",
        description="Test",
        difficulty="easy",
        is_active=True,
    )
    db_session.add(challenge)
    await db_session.flush()

    response = await client.get("/api/challenges/find-challenge")
    assert response.status_code == 200
    assert response.json()["title"] == "Find Challenge"


@pytest.mark.asyncio
async def test_health(client: AsyncClient):
    response = await client.get("/api/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"
