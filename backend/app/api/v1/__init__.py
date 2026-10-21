from fastapi import APIRouter
from app.api.v1 import health, auth, chat, memory, research, settings, voice

api_v1_router = APIRouter()

api_v1_router.include_router(health.router, tags=["Health"])
api_v1_router.include_router(auth.router, prefix="/auth", tags=["Auth"])
api_v1_router.include_router(chat.router, prefix="/chat", tags=["Companion Chat"])
api_v1_router.include_router(memory.router, prefix="/memory", tags=["Memory Management"])
api_v1_router.include_router(research.router, prefix="/research", tags=["Research Agent"])
api_v1_router.include_router(settings.router, prefix="/settings", tags=["Companion Settings"])
api_v1_router.include_router(voice.router, prefix="/voice", tags=["Voice Pipeline"])
