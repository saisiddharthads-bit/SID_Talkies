from fastapi import status

def test_memory_crud_cycle(client, test_user):
    headers = test_user["headers"]

    # 1. Create Memory
    create_res = client.post("/api/v1/memory/", headers=headers, json={
        "memory_text": "I enjoy drinking green tea every morning.",
        "category": "preference"
    })
    assert create_res.status_code == status.HTTP_201_CREATED
    mem_data = create_res.json()
    assert mem_data["memory_text"] == "I enjoy drinking green tea every morning."
    assert mem_data["category"] == "preference"
    memory_id = mem_data["id"]

    # 2. List Memories
    list_res = client.get("/api/v1/memory/", headers=headers)
    assert list_res.status_code == status.HTTP_200_OK
    assert len(list_res.json()) >= 1

    # 3. Update Memory
    update_res = client.put(f"/api/v1/memory/{memory_id}", headers=headers, json={
        "memory_text": "I enjoy drinking matcha green tea every morning."
    })
    assert update_res.status_code == status.HTTP_200_OK
    assert update_res.json()["memory_text"] == "I enjoy drinking matcha green tea every morning."

    # 4. Delete Memory
    del_res = client.delete(f"/api/v1/memory/{memory_id}", headers=headers)
    assert del_res.status_code == status.HTTP_204_NO_CONTENT

    # 5. Verify deleted
    get_res = client.get(f"/api/v1/memory/{memory_id}", headers=headers)
    assert get_res.status_code == status.HTTP_404_NOT_FOUND

def test_memory_privacy_filter(client, test_user):
    headers = test_user["headers"]

    # Attempting to store credit card or password should be rejected
    res = client.post("/api/v1/memory/", headers=headers, json={
        "memory_text": "My secret password: MySecretPass123! and my card is 4111 2222 3333 4444",
        "category": "secret"
    })
    assert res.status_code == status.HTTP_400_BAD_REQUEST
    assert "sensitive credential" in res.json()["detail"]
