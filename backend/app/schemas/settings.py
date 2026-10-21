from typing import Optional
from pydantic import BaseModel, ConfigDict

class UserSettingsUpdate(BaseModel):
    character_id: Optional[str] = None
    mode: Optional[str] = None
    voice_id: Optional[str] = None
    memory_enabled: Optional[bool] = None
    quiet_hours_enabled: Optional[bool] = None
    quiet_hours_start: Optional[str] = None
    quiet_hours_end: Optional[str] = None

class UserSettingsResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_id: str
    character_id: str
    mode: str
    voice_id: str
    memory_enabled: bool
    quiet_hours_enabled: bool
    quiet_hours_start: str
    quiet_hours_end: str
