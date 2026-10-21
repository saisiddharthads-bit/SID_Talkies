import time
from collections import defaultdict
from fastapi import HTTPException, status
from app.core.config import settings

class RateLimiter:
    def __init__(self):
        # Maps user_id -> list of request timestamps
        self.requests: dict[str, list[float]] = defaultdict(list)
        # Daily counters: user_id -> count
        self.daily_research: dict[str, int] = defaultdict(int)
        self.daily_chat: dict[str, int] = defaultdict(int)
        self.last_day = time.strftime("%Y-%m-%d")

    def _reset_if_new_day(self):
        current_day = time.strftime("%Y-%m-%d")
        if current_day != self.last_day:
            self.daily_research.clear()
            self.daily_chat.clear()
            self.last_day = current_day

    def check_rate_limit(self, identifier: str) -> None:
        now = time.time()
        window = 60.0  # 1 minute window
        user_reqs = self.requests[identifier]
        
        # Filter out timestamps older than window
        self.requests[identifier] = [t for t in user_reqs if now - t < window]

        if len(self.requests[identifier]) >= settings.RATE_LIMIT_PER_MINUTE:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Rate limit exceeded. Please wait a moment."
            )
        self.requests[identifier].append(now)

    def check_and_increment_daily(self, user_id: str, feature: str = "chat") -> None:
        self._reset_if_new_day()
        if feature == "chat":
            if self.daily_chat[user_id] >= settings.DAILY_CHAT_LIMIT:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Daily chat limit of {settings.DAILY_CHAT_LIMIT} requests reached."
                )
            self.daily_chat[user_id] += 1
        elif feature == "research":
            if self.daily_research[user_id] >= settings.DAILY_RESEARCH_LIMIT:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=f"Daily research quota of {settings.DAILY_RESEARCH_LIMIT} runs reached."
                )
            self.daily_research[user_id] += 1

limiter = RateLimiter()
