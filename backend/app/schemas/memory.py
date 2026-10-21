from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, ConfigDict

class MemoryCreate(BaseModel):
    memory_text: str = Field(..., min_length=2, max_length=1000)
    category: str = Field(default="general", max_length=50)

class MemoryUpdate(BaseModel):
    memory_text: Optional[str] = Field(None, min_length=2, max_length=1000)
    category: Optional[str] = Field(None, max_length=50)

class MemoryResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    user_id: str
    memory_text: str
    category: str
    created_at: datetime
    updated_at: datetime
