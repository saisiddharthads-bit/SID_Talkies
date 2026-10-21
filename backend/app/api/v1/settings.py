from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.api.deps import get_current_user
from app.models.user import User
from app.models.settings import UserSettings
from app.schemas.settings import UserSettingsUpdate, UserSettingsResponse

router = APIRouter()

ALLOWED_MODES = {"friend", "romantic", "business", "student", "everyday"}

@router.get("/", response_model=UserSettingsResponse)
def get_settings(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    return settings

@router.put("/", response_model=UserSettingsResponse)
def update_settings(
    update_data: UserSettingsUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    settings = db.query(UserSettings).filter(UserSettings.user_id == user.id).first()
    if not settings:
        settings = UserSettings(user_id=user.id)
        db.add(settings)

    if update_data.mode is not None:
        if update_data.mode not in ALLOWED_MODES:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid mode. Allowed modes are: {', '.join(ALLOWED_MODES)}"
            )
        settings.mode = update_data.mode

    if update_data.character_id is not None:
        settings.character_id = update_data.character_id
    if update_data.voice_id is not None:
        settings.voice_id = update_data.voice_id
    if update_data.memory_enabled is not None:
        settings.memory_enabled = update_data.memory_enabled
    if update_data.quiet_hours_enabled is not None:
        settings.quiet_hours_enabled = update_data.quiet_hours_enabled
    if update_data.quiet_hours_start is not None:
        settings.quiet_hours_start = update_data.quiet_hours_start
    if update_data.quiet_hours_end is not None:
        settings.quiet_hours_end = update_data.quiet_hours_end

    db.commit()
    db.refresh(settings)
    return settings
