from sqlalchemy import Column, String, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class UserSettings(Base):
    __tablename__ = "user_settings"

    user_id = Column(String(36), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    character_id = Column(String(50), default="sparky_fox")
    mode = Column(String(50), default="friend") # friend, romantic, business, student, everyday
    voice_id = Column(String(50), default="warm_friendly")
    memory_enabled = Column(Boolean, default=True)
    quiet_hours_enabled = Column(Boolean, default=False)
    quiet_hours_start = Column(String(5), default="22:00")
    quiet_hours_end = Column(String(5), default="08:00")

    user = relationship("User", back_populates="settings")
