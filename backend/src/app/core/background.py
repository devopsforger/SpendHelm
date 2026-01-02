# src/app/core/background.py
"""Simple background task system (replace with Celery in production)."""

import asyncio
from datetime import date
from uuid import UUID

from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.aggregates.jobs import AggregateManager
from src.app.core.database import get_engine
from src.app.core.logger import get_logger

# In-memory task queue (for development only)
_BACKGROUND_TASKS: list[tuple[UUID, date]] = []


async def enqueue_aggregate_recompute(user_id: UUID, expense_date: date) -> None:
    """
    Enqueue an aggregate recomputation task.

    In production, push to Redis/Celery instead.
    """
    _BACKGROUND_TASKS.append((user_id, expense_date))


async def run_background_worker() -> None:
    """
    Background worker that processes aggregate recomputation tasks.

    Run this in your app startup (e.g., with lifespan event).
    """
    logger = get_logger()
    logger.info("Starting background worker for aggregates")
    while True:
        if _BACKGROUND_TASKS:
            user_id, expense_date = _BACKGROUND_TASKS.pop(0)
            try:
                async with AsyncSession(get_engine()) as session:
                    manager = AggregateManager(session)
                    await manager.recompute_for_expense_date(user_id, expense_date)
            except Exception as e:
                logger.error(
                    "Background task failed",
                    user_id=str(user_id),
                    expense_date=str(expense_date),
                    error=str(e),
                )
        await asyncio.sleep(0.5)  # Poll every 500ms
