import re
from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.models.memory import Memory
from app.models.settings import UserSettings
from app.schemas.memory import MemoryCreate, MemoryUpdate
from app.core.logging import log_security_event

SENSITIVE_PATTERNS = [
    re.compile(r"\b(?:\d[ -]*?){13,16}\b"), # Credit card patterns
    re.compile(r"\b\d{3}-\d{2}-\d{4}\b"),   # SSN
    re.compile(r"(?i)\bpassword\s*[:=]\s*\S+"), # Plaintext passwords
    re.compile(r"(?i)\bpin\s*[:=]\s*\d{4,8}\b") # PINs
]

class MemoryService:
    def __init__(self, db: Session):
        self.db = db

    def _validate_privacy(self, text: str):
        for pattern in SENSITIVE_PATTERNS:
            if pattern.search(text):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Memory text contains sensitive credential or financial information and cannot be stored."
                )

    def create_memory(self, user_id: str, data: MemoryCreate) -> Memory:
        settings = self.db.query(UserSettings).filter(UserSettings.user_id == user_id).first()
        if settings and not settings.memory_enabled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Memory feature is currently disabled in your settings."
            )

        self._validate_privacy(data.memory_text)

        mem = Memory(
            user_id=user_id,
            memory_text=data.memory_text.strip(),
            category=data.category.lower().strip()
        )
        self.db.add(mem)
        self.db.commit()
        self.db.refresh(mem)
        return mem

    def list_memories(self, user_id: str, skip: int = 0, limit: int = 100) -> List[Memory]:
        return (
            self.db.query(Memory)
            .filter(Memory.user_id == user_id)
            .order_by(Memory.created_at.desc())
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_memory(self, user_id: str, memory_id: str) -> Memory:
        mem = self.db.query(Memory).filter(
            Memory.id == memory_id,
            Memory.user_id == user_id
        ).first()
        if not mem:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Memory item not found.")
        return mem

    def update_memory(self, user_id: str, memory_id: str, data: MemoryUpdate) -> Memory:
        mem = self.get_memory(user_id, memory_id)
        if data.memory_text is not None:
            self._validate_privacy(data.memory_text)
            mem.memory_text = data.memory_text.strip()
        if data.category is not None:
            mem.category = data.category.lower().strip()

        self.db.commit()
        self.db.refresh(mem)
        return mem

    def delete_memory(self, user_id: str, memory_id: str) -> None:
        mem = self.get_memory(user_id, memory_id)
        self.db.delete(mem)
        self.db.commit()

    def clear_all_memories(self, user_id: str) -> int:
        count = self.db.query(Memory).filter(Memory.user_id == user_id).delete()
        self.db.commit()
        log_security_event("MEMORY_WIPED", user_id, f"Deleted {count} memories.")
        return count
