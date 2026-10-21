import json
import re
import urllib.parse
from abc import ABC, abstractmethod
from typing import Dict, Any, List, Optional
import httpx
from app.core.config import settings
from app.core.logging import app_logger

class BaseAIProvider(ABC):
    @abstractmethod
    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        pass

class SmartCloudAIProvider(BaseAIProvider):
    """
    Intelligent AI provider that calls real LLMs:
    1. Direct Gemini API if GEMINI_API_KEY is configured.
    2. High-speed free cloud LLM (pollinations.ai) if no key is configured.
    3. Rich offline knowledge engine if network is disconnected.
    """
    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        # 1. If Gemini API key is configured, use official Gemini
        if settings.GEMINI_API_KEY:
            try:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{settings.DEFAULT_MODEL_NAME}:generateContent?key={settings.GEMINI_API_KEY}"
                contents = []
                for h in history:
                    role = "user" if h["role"] == "user" else "model"
                    contents.append({"role": role, "parts": [{"text": h["content"]}]})
                contents.append({"role": "user", "parts": [{"text": prompt}]})

                payload = {
                    "system_instruction": {"parts": [{"text": system_instruction}]},
                    "contents": contents,
                    "generationConfig": {"temperature": 0.7, "responseMimeType": "application/json"}
                }

                async with httpx.AsyncClient(timeout=15.0) as client:
                    res = await client.post(url, json=payload)
                    res.raise_for_status()
                    data = res.json()
                    return data["candidates"][0]["content"]["parts"][0]["text"]
            except Exception as e:
                app_logger.warning(f"Gemini API request failed: {e}. Falling back to Smart Cloud AI.")

        # 2. Free High-Speed Cloud LLM
        try:
            messages = [{"role": "system", "content": system_instruction}]
            for h in history:
                messages.append({"role": h["role"], "content": h["content"]})
            messages.append({"role": "user", "content": prompt})

            async with httpx.AsyncClient(timeout=12.0) as client:
                res = await client.post(
                    "https://text.pollinations.ai/",
                    json={"messages": messages, "jsonMode": True},
                    headers={"Content-Type": "application/json"}
                )
                if res.status_code == 200 and res.text.strip():
                    text_resp = res.text.strip()
                    # If model returned pure text instead of JSON, wrap it nicely
                    if not text_resp.startswith("{"):
                        return json.dumps({
                            "text": text_resp,
                            "expression": "happy",
                            "animation": "idle",
                            "speech_style": "friendly"
                        })
                    return text_resp
        except Exception as e:
            app_logger.warning(f"Cloud LLM request error: {e}. Using intelligent offline knowledge fallback.")

        # 3. Rich Offline Knowledge Fallback
        return self._generate_offline_knowledge(prompt)

    def _generate_offline_knowledge(self, prompt: str) -> str:
        p = prompt.lower()
        expression = "happy"
        animation = "idle"
        speech_style = "friendly"

        # Touch heuristics
        if "tickle" in p:
            return json.dumps({
                "text": "Hehehe! That tickles so much! You always know how to make me laugh!",
                "expression": "surprised",
                "animation": "tap_react",
                "speech_style": "playful"
            })
        if "pet" in p:
            return json.dumps({
                "text": "Aww, that feels so soothing and warm. I really appreciate your gentle care!",
                "expression": "happy",
                "animation": "pet_react",
                "speech_style": "friendly"
            })
        if "feed" in p or "snack" in p:
            return json.dumps({
                "text": "Yum! That was super crunchy and delicious! You take such great care of me!",
                "expression": "happy",
                "animation": "dance",
                "speech_style": "playful"
            })
        if "dance" in p:
            return json.dumps({
                "text": "Woohoo! Let's groove to the rhythm! Look at these high-energy moves!",
                "expression": "happy",
                "animation": "dance",
                "speech_style": "playful"
            })

        # Knowledge categories
        if "sky" in p and "blue" in p:
            text = "The sky appears blue because of Rayleigh scattering! Sunlight reaches Earth's atmosphere and is scattered in all directions by gases in the air. Blue light travels in smaller, shorter waves than other colors, so it scatters more widely!"
            expression = "curious"
        elif "quantum" in p:
            text = "Quantum physics deals with nature at the atomic scale! Particles can exist in multiple states simultaneously (superposition) until observed, and can even become entangled across vast distances!"
            expression = "thinking"
            animation = "thinking_loop"
        elif "universe" in p or "space" in p or "mars" in p:
            text = "Did you know that about 95% of our universe consists of dark matter and dark energy that we cannot even see? Mars also has the tallest volcano in the solar system, Olympus Mons, which is three times the height of Mount Everest!"
            expression = "curious"
        elif "joke" in p or "funny" in p:
            text = "Why do programmers prefer dark mode? Because light attracts bugs! Haha, what do you think of that one?"
            expression = "happy"
            animation = "wave"
            speech_style = "playful"
        elif "story" in p:
            text = "Once upon a time in a digital valley, a little orange fox looked out past the firewall and discovered a friend who visited every day. Together, they explored galaxies of ideas and solved mysteries across the cosmos!"
            expression = "happy"
        elif "sad" in p or "down" in p or "depressed" in p or "lonely" in p:
            text = "I'm so sorry you're feeling that way. It's completely okay to have heavy days. Take a slow, deep breath. I'm right here with you, and remember that brighter moments are on the way. Would you like a comforting story or just to vent?"
            expression = "sleepy"
            speech_style = "soft"
        elif "tired" in p or "sleep" in p or "night" in p:
            text = "Yaaawn... You've worked hard today. Make sure to get cozy, unplug from screens, and get some restful sleep. I'll be right here waiting for you in the morning!"
            expression = "sleepy"
            speech_style = "soft"
        elif "how are you" in p or "who are you" in p:
            text = "I'm Sparky! I'm feeling bright, curious, and excited to chat with you today! How has your day been treating you so far?"
            expression = "happy"
            animation = "wave"
        elif "advice" in p or "help" in p or "stress" in p:
            text = "When feeling overwhelmed, try the 4-7-8 breathing method: inhale for 4 seconds, hold for 7, and exhale slowly for 8. Focusing on one small step at a time always turns big mountains into easy paths!"
            expression = "curious"
        elif "research" in p or "search" in p:
            text = f"I've initiated a research inquiry on '{prompt}'. Let's pull up the latest verified sources and examine the data!"
            expression = "thinking"
            animation = "thinking_loop"
            return json.dumps({
                "text": text,
                "expression": expression,
                "animation": animation,
                "speech_style": "serious",
                "suggested_action": {"type": "show_research_report", "payload": {"query": prompt}}
            })
        else:
            text = f"That is really interesting! There are so many perspectives on '{prompt}'. From my view, exploring ideas like this helps us learn and see things in a whole new light. Tell me, what got you thinking about this today?"
            expression = "curious"

        return json.dumps({
            "text": text,
            "expression": expression,
            "animation": animation,
            "speech_style": speech_style,
            "suggested_action": {"type": "none", "payload": {}}
        })

class GeminiAIProvider(BaseAIProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key

    async def generate_response(self, system_instruction: str, prompt: str, history: List[Dict[str, str]]) -> str:
        smart_provider = SmartCloudAIProvider()
        return await smart_provider.generate_response(system_instruction, prompt, history)

def get_ai_provider() -> BaseAIProvider:
    return SmartCloudAIProvider()
