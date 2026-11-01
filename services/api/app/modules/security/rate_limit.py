import asyncio
import time
from collections import defaultdict, deque
from typing import Deque, Dict

from fastapi import HTTPException, Request, status

from app.core.config import settings


class LoginRateLimiter:
    def __init__(self) -> None:
        self._hits: Dict[str, Deque[float]] = defaultdict(deque)
        self._lock = asyncio.Lock()

    async def check(self, request: Request) -> None:
        client = request.client.host if request.client else "unknown"
        now = time.monotonic()
        window = 60.0
        limit = settings.LOGIN_RATE_LIMIT_PER_MINUTE
        async with self._lock:
            hits = self._hits[client]
            while hits and now - hits[0] > window:
                hits.popleft()
            if len(hits) >= limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Demasiados intentos de inicio de sesión. Intente más tarde.",
                )
            hits.append(now)


login_rate_limiter = LoginRateLimiter()
