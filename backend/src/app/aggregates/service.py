# src/app/aggregates/service.py
"""Service layer for managing expense aggregates."""

from datetime import date
from uuid import UUID

from src.app.aggregates.model import Aggregate
from src.app.aggregates.repository import AggregateRepository
from src.app.aggregates.schemas import AggregateFilter
from src.app.auth.model import User
from src.app.core.exceptions import AggregateNotFoundException


class AggregateService:
    """Service layer for managing expense aggregates (read-only)."""

    def __init__(self, repo: AggregateRepository):
        self.repo = repo

    async def get_aggregate(
        self,
        requesting_user: User,
        target_user_id: UUID,
        period_type: str,
        period_start: date,
    ) -> Aggregate:
        """
        Retrieve a specific aggregate.

        Only the user themselves or an admin can access.
        """
        if not (requesting_user.is_admin or requesting_user.id == target_user_id):
            from src.app.core.exceptions import PermissionDeniedException

            raise PermissionDeniedException(action="view", resource="aggregate")

        aggregate = await self.repo.get_by_user_and_period(
            target_user_id, period_type, period_start
        )
        if not aggregate:
            raise AggregateNotFoundException(target_user_id, period_type, period_start)
        return aggregate

    async def list_aggregates(
        self,
        requesting_user: User,
        target_user_id: UUID,
        filters: AggregateFilter,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Aggregate]:
        """
        List aggregates for a user with filters.

        Only the user themselves or an admin can access.
        """
        if not (requesting_user.is_admin or requesting_user.id == target_user_id):
            from src.app.core.exceptions import PermissionDeniedException

            raise PermissionDeniedException(action="view", resource="aggregate")

        return await self.repo.list_by_user(
            user_id=target_user_id,
            period_type=filters.period_type,
            start_date=filters.start_date,
            end_date=filters.end_date,
            offset=offset,
            limit=limit,
        )
