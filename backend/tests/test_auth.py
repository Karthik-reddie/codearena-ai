import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_signup(client: AsyncClient):
    response = await client.post(
        "/api/auth/signup",
        json={
            "username": "newuser",
            "email": "new@example.com",
            "password": "NewUser@123",
            "full_name": "New User",
        },
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["username"] == "newuser"
    assert data["user"]["email"] == "new@example.com"


@pytest.mark.asyncio
async def test_signup_duplicate_email(client: AsyncClient, test_user):
    response = await client.post(
        "/api/auth/signup",
        json={
            "username": "another",
            "email": "test@example.com",
            "password": "Test@12345",
        },
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_login(client: AsyncClient, test_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "Test@123"},
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, test_user):
    response = await client.post(
        "/api/auth/login",
        json={"email": "test@example.com", "password": "WrongPass@123"},
    )
    assert response.status_code == 401


@pytest.mark.asyncio
async def test_get_me(client: AsyncClient, auth_headers):
    response = await client.get("/api/auth/me", headers=auth_headers)
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


@pytest.mark.asyncio
async def test_update_me(client: AsyncClient, auth_headers):
    response = await client.put(
        "/api/auth/me",
        headers=auth_headers,
        json={"full_name": "Updated Name", "bio": "Hello!"},
    )
    assert response.status_code == 200
    assert response.json()["full_name"] == "Updated Name"


@pytest.mark.asyncio
async def test_forgot_password(client: AsyncClient, test_user):
    response = await client.post(
        "/api/auth/forgot-password",
        json={"email": "test@example.com"},
    )
    assert response.status_code == 200


@pytest.mark.asyncio
async def test_unauthorized_access(client: AsyncClient):
    response = await client.get("/api/auth/me")
    assert response.status_code == 403
