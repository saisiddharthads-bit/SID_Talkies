from fastapi import APIRouter, Depends
from app.api.deps import get_current_user, check_rate_limit
from app.models.user import User
from app.schemas.voice import SpeechSynthesisRequest, SpeechSynthesisResponse
from app.services.voice_service import voice_service

router = APIRouter()

@router.post("/synthesize", response_model=SpeechSynthesisResponse, dependencies=[Depends(check_rate_limit)])
def synthesize_speech(
    req: SpeechSynthesisRequest,
    user: User = Depends(get_current_user)
):
    return voice_service.synthesize_speech(req)
