from fastapi import status

def test_health_check(client):
    res = client.get("/api/v1/health")
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert data["status"] == "online"
    assert data["database"] == "ok"

def test_register_and_login(client):
    # Register
    res = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepassword123"
    })
    assert res.status_code == status.HTTP_201_CREATED
    data = res.json()
    assert "access_token" in data
    assert data["email"] == "newuser@example.com"

    # Duplicate register should fail
    dup_res = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "securepassword123"
    })
    assert dup_res.status_code == status.HTTP_400_BAD_REQUEST

    # Login
    login_res = client.post("/api/v1/auth/login", json={
        "email": "newuser@example.com",
        "password": "securepassword123"
    })
    assert login_res.status_code == status.HTTP_200_OK
    assert "access_token" in login_res.json()

def test_account_deletion_erasure(client, test_user):
    headers = test_user["headers"]
    
    # Check profile
    me_res = client.get("/api/v1/auth/me", headers=headers)
    assert me_res.status_code == status.HTTP_200_OK

    # Delete account
    del_res = client.delete("/api/v1/auth/me", headers=headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # Profile should now fail with 401
    me_after = client.get("/api/v1/auth/me", headers=headers)
    assert me_after.status_code == status.HTTP_401_UNAUTHORIZED
