from fastapi import status

def test_voice_synthesis_and_phonemes(client, test_user):
    headers = test_user["headers"]

    res = client.post("/api/v1/voice/synthesize", headers=headers, json={
        "text": "Hello, I am Sparky your loyal companion!",
        "speech_style": "friendly"
    })
    assert res.status_code == status.HTTP_200_OK
    data = res.json()
    assert "audio_base64" in data
    assert len(data["audio_base64"]) > 50
    assert data["format"] == "wav"
    assert "phoneme_cues" in data
    assert len(data["phoneme_cues"]) > 0
    # Viseme cue contains viseme name, duration, and target word
    assert "viseme" in data["phoneme_cues"][0]
