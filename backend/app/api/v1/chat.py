from typing import List, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.rate_limiter import limiter
from app.api.deps import get_current_user, check_rate_limit
from app.models.user import User
from app.models.conversation import Conversation, Message
from app.schemas.chat import ChatRequest, ChatResponse, MessageHistoryItem
from app.services.companion_service import CompanionService

router = APIRouter()

@router.post("/", response_model=ChatResponse, dependencies=[Depends(check_rate_limit)])
async def chat_with_companion(
    request: ChatRequest,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    limiter.check_and_increment_daily(user.id, feature="chat")
    service = CompanionService(db)
    conv_id, structured_reply = await service.chat(
        user_id=user.id,
        message=request.message,
        conversation_id=request.conversation_id,
        touch_context=request.touch_context
    )
    return ChatResponse(
        conversation_id=conv_id,
        reply=structured_reply
    )

@router.get("/history", response_model=List[MessageHistoryItem])
def get_chat_history(
    conversation_id: str,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
    limit: int = Query(default=50, le=100)
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.user_id == user.id
    ).first()
    if not conv:
        return []

    messages = (
        db.query(Message)
        .filter(Message.conversation_id == conv.id)
        .order_by(Message.created_at.asc())
        .limit(limit)
        .all()
    )
    return [
        MessageHistoryItem(
            id=m.id,
            role=m.role,
            content=m.content,
            expression=m.expression or "idle",
            animation=m.animation or "idle",
            created_at=m.created_at.isoformat()
        )
        for m in messages
    ]

@router.get("/conversations")
def list_conversations(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    convs = (
        db.query(Conversation)
        .filter(Conversation.user_id == user.id)
        .order_by(Conversation.created_at.desc())
        .all()
    )
    return [{"id": c.id, "title": c.title, "created_at": c.created_at.isoformat()} for c in convs]
