"""
Async database configuration and connection management for KwizCraft.

This module configures the SQLAlchemy async engine and provides a FastAPI dependency
for injecting async SQLModel sessions. It follows SQLAlchemy 2.0+ async best practices
with connection pooling suitable for web applications.

Dependencies:
    - sqlalchemy>=2.0.44
    - sqlmodel>=0.0.27
    - tenacity>=9.1.2 (for retries)

Examples:
    >>> from app.core.database import get_db
    >>> async def endpoint(db = Depends(get_db)): ...
"""

from __future__ import annotations

from typing import AsyncGenerator

from sqlalchemy import text
from sqlalchemy.exc import OperationalError
from sqlalchemy.ext.asyncio import AsyncEngine, create_async_engine
from sqlmodel.ext.asyncio.session import AsyncSession as SQLModelAsyncSession
from tenacity import retry, stop_after_attempt, wait_exponential

from src.app.core.config import config


# --------------------------------------------------------------------------- #
# Engine cache – a plain module-level variable (type-ignored for PyLance)
# --------------------------------------------------------------------------- #
# pylint: disable=invalid-name
_engine: AsyncEngine | None = None  # type: ignore[assignment]


def get_engine() -> AsyncEngine:
    """
    Return a **singleton** async engine built from the current ``config.DATABASE_URL``.

    The engine is created only once per process and cached in the module-level
    ``_engine`` variable.  This allows ``app.dependency_overrides`` in tests to
    replace the engine at runtime without touching the function object.
    """
    global _engine  # noqa: PLW0603
    if _engine is None:
        _engine = create_async_engine(
            config.DATABASE_URL,
            echo=config.DEBUG_MODE,
            pool_size=10,
            pool_pre_ping=True,
            pool_recycle=3600,
            max_overflow=20,
            future=True,
        )
    return _engine


@retry(
    stop=stop_after_attempt(5),
    wait=wait_exponential(multiplier=1, min=2, max=10),
    reraise=True,
    retry=lambda exc: isinstance(exc, OperationalError),
)
async def init_db() -> None:
    """
    Verify DB connectivity with retries.

    Called from the FastAPI lifespan event.
    """
    async with get_engine().begin() as conn:
        await conn.execute(text("SELECT 1"))


async def get_db() -> AsyncGenerator[SQLModelAsyncSession, None]:
    """
    FastAPI dependency that yields a SQLModel async session.

    * Auto-commit on success
    * Auto-rollback on exception
    * Session is always closed
    """
    engine = get_engine()
    async with SQLModelAsyncSession(engine, expire_on_commit=False) as session:
        try:
            yield session
            await session.commit()
        except Exception:  # pylint: disable=broad-except
            await session.rollback()
            raise
        finally:
            await session.close()


def reset_engine():
    """Reset the cached engine (for testing purposes)."""

    global _engine
    _engine = None
