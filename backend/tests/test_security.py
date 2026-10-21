from fastapi import status

def test_cross_user_memory_isolation(client, test_user, second_user):
    headers_user_a = test_user["headers"]
    headers_user_b = second_user["headers"]

    # User A creates a personal memory
    res_a = client.post("/api/v1/memory/", headers=headers_user_a, json={
        "memory_text": "User A confidential personal goal: run 5km.",
        "category": "goal"
    })
    assert res_a.status_code == status.HTTP_201_CREATED
    mem_id = res_a.json()["id"]

    # User B lists memories -> should NOT see User A's memory
    res_b_list = client.get("/api/v1/memory/", headers=headers_user_b)
    assert res_b_list.status_code == status.HTTP_200_OK
    user_b_mems = res_b_list.json()
    assert all(m["id"] != mem_id for m in user_b_mems)

    # User B attempts direct GET of User A's memory -> 404 NOT FOUND
    res_b_get = client.get(f"/api/v1/memory/{mem_id}", headers=headers_user_b)
    assert res_b_get.status_code == status.HTTP_404_NOT_FOUND

    # User B attempts to DELETE User A's memory -> 404 NOT FOUND
    res_b_del = client.delete(f"/api/v1/memory/{mem_id}", headers=headers_user_b)
    assert res_b_del.status_code == status.HTTP_404_NOT_FOUND

def test_settings_mode_switching(client, test_user):
    headers = test_user["headers"]

    # Get settings
    res = client.get("/api/v1/settings/", headers=headers)
    assert res.status_code == status.HTTP_200_OK
    assert res.json()["mode"] == "friend"

    # Switch to business mode
    update_res = client.put("/api/v1/settings/", headers=headers, json={
        "mode": "business"
    })
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["mode"] == "business"

    # Invalid mode test
    invalid_res = client.put("/api/v1/settings/", headers=headers, json={
        "mode": "unsupported_god_mode"
    })
    assert invalid_res.status_code == status.HTTP_400_BAD_REQUEST
