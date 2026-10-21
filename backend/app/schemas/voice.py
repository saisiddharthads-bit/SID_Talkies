from typing import Optional, List
from pydantic import BaseModel

class SpeechSynthesisRequest(BaseModel):
    text: str
    voice_id: Optional[str] = "warm_friendly"
    speech_style: Optional[str] = "friendly"

class SpeechSynthesisResponse(BaseModel):
    audio_base64: str
    format: str = "wav"
    phoneme_cues: Optional[List[dict]] = None

class SpeechTranscriptionResponse(BaseModel):
    transcribed_text: str
    confidence: float
