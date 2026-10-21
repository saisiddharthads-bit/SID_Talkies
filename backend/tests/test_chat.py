from fastapi import status

def test_chat_interaction_and_structure(client, test_user):
    headers = test_user["headers"]
    
    # 1. Send friendly greeting
    res = client.post("/api/v1/chat/", headers=headers, json={
        "message": "Hello there! How are you doing today?",
        "touch_context": "tapped"
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "conversation_id" in data
    assert "reply" in data
    
    reply = data["reply"]
    assert "text" in reply
    assert reply["expression"] in ["idle", "happy", "curious", "surprised", "sleepy", "listening", "thinking"]
    assert reply["animation"] in ["idle", "tap_react", "pet_react", "wave", "dance", "thinking_loop"]
    assert reply["speech_style"] in ["friendly", "playful", "serious", "encouraging", "soft"]

    # 2. Touch reaction test
    touch_res = client.post("/api/v1/chat/", headers=headers, json={
        "message": "tickle",
        "touch_context": "tickled"
    })
    assert touch_res.status_code == status.HTTP_200_OK
    touch_reply = touch_res.json()["reply"]
    assert touch_reply["animation"] == "tap_react"
    assert touch_reply["expression"] == "surprised"

def test_chat_history_retrieval(client, test_user):
    headers = test_user["headers"]
    # Send a message
    res = client.post("/api/v1/chat/", headers=headers, json={
        "message": "Can you dance for me?"
    })
    conv_id = res.json()["conversation_id"]

    # Retrieve history
    hist_res = client.get(f"/api/v1/chat/history?conversation_id={conv_id}", headers=headers)
    assert hist_res.status_code == status.HTTP_200_OK
    messages = hist_res.json()
    assert len(messages) >= 2
    assert messages[0]["role"] == "user"
    assert messages[1]["role"] == "assistant"
