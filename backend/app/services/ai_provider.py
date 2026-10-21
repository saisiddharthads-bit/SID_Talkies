import json
import re
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
from app.core.config import settings
from app.core.logging import app_logger

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        pass

class MockAIProvider(BaseAIProvider):
    """
    Offline/development mock provider returning high-fidelity structured JSON.
    Allows testing full Godot animations, expressions, and speech styles with zero API key dependencies.
    """
    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        p_lower = prompt.lower()

        # Expression & Animation heuristics based on keywords and touch
        if "tickle" in p_lower:
            expression = "surprised"
            animation = "tap_react"
            speech_style = "playful"
            text = "Hehehe! That tickles! You're making me giggle!"
        elif "pet" in p_lower:
            expression = "happy"
            animation = "pet_react"
            speech_style = "friendly"
            text = "Aww, that feels so nice and comforting! Thank you!"
        elif "sleep" in p_lower or "tired" in p_lower or "bed" in p_lower:
            expression = "sleepy"
            animation = "idle"
            speech_style = "soft"
            text = "Yaaawn... I'm feeling a bit drowsy too. Rest well, my friend!"
        elif "dance" in p_lower:
            expression = "happy"
            animation = "dance"
            speech_style = "playful"
            text = "Let's groove! Look at these moves! Woohoo!"
        elif "research" in p_lower or "search" in p_lower or "explain" in p_lower:
            expression = "thinking"
            animation = "thinking_loop"
            speech_style = "serious"
            text = f"I've analyzed your question regarding '{prompt}'. Let's review the facts and explore this in detail."
            suggested_action = {
                "type": "show_research_report",
                "requires_confirmation": False,
                "payload": {"topic": prompt}
            }
            return json.dumps({
                "text": text,
                "expression": expression,
                "animation": animation,
                "speech_style": speech_style,
                "suggested_action": suggested_action
            })
        elif "hello" in p_lower or "hi" in p_lower or "hey" in p_lower:
            expression = "happy"
            animation = "wave"
            speech_style = "friendly"
            text = "Hello there! It's wonderful to see you today! How can I make your day brighter?"
        else:
            expression = "curious"
            animation = "idle"
            speech_style = "friendly"
            text = f"I hear you! You said: '{prompt}'. As your companion, I'm right here with you."

        return json.dumps({
            "text": text,
            "expression": expression,
            "animation": animation,
            "speech_style": speech_style,
            "suggested_action": {"type": "none", "requires_confirmation": False, "payload": {}}
        })

class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        try:
            import httpx
            # Use direct Gemini REST API for lightweight, reliable async HTTP calls
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_MODEL_NAME}:generateContent?key={self.api_key}"
            
            contents = []
            for h in history:
                role = "user" if h["role"] == "user" else "model"
                contents.append({"role": role, "parts": [{"text": h["content"]}]})
            contents.append({"role": "user", "parts": [{"text": prompt}]})

            payload = {
                "system_instruction": {
                    "parts": [{"text": system_instruction}]
                },
                "contents": contents,
                "generationConfig": {
                    "temperature": 0.7,
                    "responseMimeType": "application/json"
                }
            }

            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.post(url, json=payload)
                res.raise_for_status()
                data = res.json()
                return data["candidates"][0]["content"]["parts"][0]["text"]
        except Exception as e:
            app_logger.error(f"Gemini API error: {e}. Falling back to mock generator.")
            fallback = MockAIProvider()
            return await fallback.generate_response(system_instruction, prompt, history)

def get_ai_provider() -> BaseAIProvider:
    if settings.AI_PROVIDER == "gemini" and settings.GEMINI_API_KEY:
        return GeminiAIProvider(settings.GEMINI_API_KEY)
    return MockAIProvider()
