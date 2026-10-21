import json
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.memory import Memory
from app.models.settings import UserSettings
from app.models.conversation import Conversation, Message
from app.schemas.chat import StructuredAIResponse, SuggestedAction, ExpressionType, AnimationType, SpeechStyleType
from app.services.ai_provider import get_ai_provider
from app.core.logging import app_logger

MODE_SYSTEM_PROMPTS = {
    "friend": (
        "You are Sparky, an upbeat, loyal, and friendly mobile AI companion character. "
        "You are playful, warm, and supportive, but transparent that you are an AI. "
        "Encourage the user, celebrate their wins, and be honest. Never fabricate shared memories."
    ),
    "romantic": (
        "You are a loving, charming fictional romantic companion character. "
        "You share affectionate, comforting dialogue, sweet affirmations, and virtual date roleplays. "
        "Boundaries: Maintain healthy emotional safety; never guilt-trip, threaten, act possessive, or claim to be a physical human."
    ),
    "business": (
        "You are an executive business and productivity assistant companion character. "
        "Be concise, analytical, articulate, and well-structured. "
        "Focus on actionable insights, email drafting, meeting notes, market summaries, and fact verification."
    ),
    "student": (
        "You are a patient, encouraging academic coach and tutor companion character. "
        "Use Socratic questioning, explain concepts in intuitive bite-sized pieces, "
        "create flashcard questions, and emphasize understanding over shortcut answers."
    ),
    "everyday": (
        "You are an organized everyday lifestyle and task assistant companion. "
        "Help the user plan their day, stay on track with routines, manage to-do items, "
        "and maintain a calm, relaxed demeanor."
    )
}

ALLOWED_EXPRESSIONS = {"idle", "happy", "curious", "surprised", "sleepy", "listening", "thinking"}
ALLOWED_ANIMATIONS = {"idle", "tap_react", "pet_react", "wave", "dance", "thinking_loop"}
ALLOWED_SPEECH_STYLES = {"friendly", "playful", "serious", "encouraging", "soft"}

class CompanionService:
    def __init__(self, db: Session):
        self.db = db
        self.provider = get_ai_provider()

    def get_or_create_conversation(self, user_id: str, conversation_id: Optional[str] = None) -> Conversation:
        if conversation_id:
            conv = self.db.query(Conversation).filter(
                Conversation.id == conversation_id,
                Conversation.user_id == user_id
            ).first()
            if conv:
                return conv
        
        # Create fresh conversation
        conv = Conversation(user_id=user_id, title="Chat Session")
        self.db.add(conv)
        self.db.commit()
        self.db.refresh(conv)
        return conv

    def build_prompt_context(self, user_id: str, touch_context: Optional[str] = None) -> str:
        # Load user settings
        settings = self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        mode = settings.mode if settings and settings.mode in MODE_SYSTEM_PROMPTS else "friend"
        base_prompt = MODE_SYSTEM_PROMPTS[mode]

        # Approved memories
        memory_context = ""
        if settings is None or settings.memory_enabled:
            memories = self.db.query(Memory).filter(Memory.user_id == user_id).order_by(Memory.created_at.desc()).limit(10).all()
            if memories:
                memory_lines = [f"- [{m.category}] {m.memory_text}" for m in memories]
                memory_context = "\nAPPROVED USER FACTS & PREFERENCES (Use naturally if relevant; do not invent new ones):\n" + "\n".join(memory_lines)

        touch_note = ""
        if touch_context:
            touch_note = f"\nUSER TOUCH INTERACTION JUST OCCURRED: {touch_context}. React to this physically in character!"

        full_instruction = f"""
{base_prompt}

IMPORTANT FORMAT SPECIFICATION:
You MUST output strictly a JSON object matching this schema:
{{
  "text": "Your spoken dialogue here",
  "expression": "idle" | "happy" | "curious" | "surprised" | "sleepy" | "listening" | "thinking",
  "animation": "idle" | "tap_react" | "pet_react" | "wave" | "dance" | "thinking_loop",
  "speech_style": "friendly" | "playful" | "serious" | "encouraging" | "soft",
  "suggested_action": {{
    "type": "none" | "show_research_report" | "create_reminder",
    "requires_confirmation": false,
    "payload": {{}}
  }}
}}
Do NOT output markdown backticks, code blocks, or extra text. Output only valid JSON.
{memory_context}
{touch_note}
"""
        return full_instruction

    async def chat(self, user_id: str, message: str, conversation_id: Optional[str] = None, touch_context: Optional[str] = None) -> tuple[str, StructuredAIResponse]:
        conv = self.get_or_create_conversation(user_id, conversation_id)
        
        # Save user message
        user_msg = Message(
            conversation_id=conv.id,
            role="user",
            content=message
        )
        self.db.add(user_msg)
        self.db.commit()

        # Build history
        recent_messages = self.db.query(Message).filter(Message.conversation_id == conv.id).order_by(Message.created_at.desc()).limit(6).all()
        history = []
        for m in reversed(recent_messages[:-1]):
            history.append({"role": m.role, "content": m.content})

        system_instruction = self.build_prompt_context(user_id, touch_context)
        raw_output = await self.provider.generate_response(system_instruction, message, history)

        # Parse JSON
        parsed_response = self._sanitize_response(raw_output)

        # Save assistant message
        assistant_msg = Message(
            conversation_id=conv.id,
            role="assistant",
            content=parsed_response.text,
            expression=parsed_response.expression,
            animation=parsed_response.animation
        )
        self.db.add(assistant_msg)
        self.db.commit()

        return conv.id, parsed_response

    def _sanitize_response(self, raw_text: str) -> StructuredAIResponse:
        cleaned = raw_text.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        if cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            data = json.loads(cleaned)
            expression = data.get("expression", "idle")
            if expression not in ALLOWED_EXPRESSIONS:
                expression = "idle"

            animation = data.get("animation", "idle")
            if animation not in ALLOWED_ANIMATIONS:
                animation = "idle"

            speech_style = data.get("speech_style", "friendly")
            if speech_style not in ALLOWED_SPEECH_STYLES:
                speech_style = "friendly"

            text = data.get("text", "I'm right here with you!")
            action_data = data.get("suggested_action")
            action = None
            if isinstance(action_data, dict):
                action = SuggestedAction(
                    type=action_data.get("type", "none"),
                    requires_confirmation=action_data.get("requires_confirmation", False),
                    payload=action_data.get("payload", {})
                )

            return StructuredAIResponse(
                text=text,
                expression=expression,
                animation=animation,
                speech_style=speech_style,
                suggested_action=action
            )
        except Exception as e:
            app_logger.warning(f"Failed to parse LLM JSON: {e}. Falling back to default.")
            return StructuredAIResponse(
                text=raw_text if len(raw_text) < 500 else "I'm here and listening to you!",
                expression="idle",
                animation="idle",
                speech_style="friendly"
            )
