from typing import Optional, Dict, Any, Literal
from pydantic import BaseModel, Field, ConfigDict

ExpressionType = Literal["idle", "happy", "curious", "surprised", "sleepy", "listening", "thinking"]
AnimationType = Literal["idle", "tap_react", "pet_react", "wave", "dance", "thinking_loop"]
SpeechStyleType = Literal["friendly", "playful", "serious", "encouraging", "soft"]

class SuggestedAction(BaseModel):
    type: str = "none"  # "none", "show_research_report", "create_reminder", "analyze_file"
    requires_confirmation: bool = False
    payload: Dict[str, Any] = Field(default_factory=dict)

class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4000)
    conversation_id: Optional[str] = None
    character_id: Optional[str] = None
    touch_context: Optional[str] = None  # e.g., "petted", "tickled", "tapped"

class StructuredAIResponse(BaseModel):
    text: str
    expression: ExpressionType = "idle"
    animation: AnimationType = "idle"
    speech_style: SpeechStyleType = "friendly"
    suggested_action: Optional[SuggestedAction] = None

class ChatResponse(BaseModel):
    conversation_id: str
    reply: StructuredAIResponse
    audio_base64: Optional[str] = None  # Optional voice synthesis

class MessageHistoryItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    role: str
    content: str
    expression: Optional[str] = "idle"
    animation: Optional[str] = "idle"
    created_at: str
