"""Expense aggregates API routes."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from fastapi_pagination import LimitOffsetPage, LimitOffsetParams, paginate
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.aggregates.repository import AggregateRepository
from src.app.aggregates.schemas import AggregateFilter, AggregateRead
from src.app.aggregates.service import AggregateService
from src.app.auth.dependencies import get_current_user
from src.app.auth.model import User
from src.app.core.database import get_db

router = APIRouter(prefix="/api/v1/aggregates", tags=["Aggregates"])


def get_aggregate_service(session: AsyncSession = Depends(get_db)) -> AggregateService:
    """Dependency to get AggregateService instance."""
    repo = AggregateRepository(session)
    return AggregateService(repo)


@router.get("/{user_id}/{period_type}/{period_start}", response_model=AggregateRead)
async def get_aggregate(
    user_id: UUID,
    period_type: str,
    period_start: date,
    current_user: User = Depends(get_current_user),
    service: AggregateService = Depends(get_aggregate_service),
):
    """
    Get a specific aggregate for a user.

    Period type must be 'daily', 'weekly', or 'monthly'.
    Period start is a date (e.g., 2025-01-01).
    """
    return await service.get_aggregate(current_user, user_id, period_type, period_start)


@router.get("/{user_id}", response_model=LimitOffsetPage[AggregateRead])
async def list_aggregates(
    user_id: UUID,
    period_type: str = Query(..., pattern="^(daily|weekly|monthly)$"),
    start_date: date | None = None,
    end_date: date | None = None,
    params: LimitOffsetParams = Depends(),
    current_user: User = Depends(get_current_user),
    service: AggregateService = Depends(get_aggregate_service),
):
    """
    List aggregates for a user with optional date range.

    Period type must be 'daily', 'weekly', or 'monthly'.
    """
    filters = AggregateFilter(
        period_type=period_type,
        start_date=start_date,
        end_date=end_date,
    )
    aggregates = await service.list_aggregates(
        requesting_user=current_user,
        target_user_id=user_id,
        filters=filters,
        offset=params.offset,
        limit=params.limit,
    )
    return paginate(aggregates, params)
