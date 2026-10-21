import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    PROJECT_NAME: str = "SID_Talkies Backend"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True
    API_V1_STR: str = "/api/v1"
    
    # CORS
    BACKEND_CORS_ORIGINS: List[str] = ["*"]

    # Database
    DATABASE_URL: str = "sqlite:///./sid_talkies.db"

    # Security & JWT
    SECRET_KEY: str = "default_development_secret_key_change_in_production_1234567890"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days

    # AI Configuration
    AI_PROVIDER: str = "mock"  # "gemini", "openai", "mock"
    GEMINI_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    DEFAULT_MODEL_NAME: str = "gemini-2.5-flash"

    # Search Configuration
    SEARCH_PROVIDER: str = "mock"  # "mock", "tavily", "serper"
    SEARCH_API_KEY: str = ""

    # Quotas & Rate Limits
    RATE_LIMIT_PER_MINUTE: int = 60
    DAILY_RESEARCH_LIMIT: int = 25
    DAILY_CHAT_LIMIT: int = 300

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
