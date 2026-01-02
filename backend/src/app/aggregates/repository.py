"""Repository for managing expense aggregates in the database."""

from datetime import date
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.aggregates.model import Aggregate
from src.app.core.exceptions import (
    DatabaseException,
)
from src.app.core.logger import get_logger

logger = get_logger()


class AggregateRepository:
    """Repository for managing expense aggregates in the database."""

    _VALID_PERIODS = {"daily", "weekly", "monthly"}

    def __init__(self, session: AsyncSession):
        self.session = session

    def validate_period_type(self, period_type: str) -> None:
        """Validate period type against allowed values."""
        if period_type not in self._VALID_PERIODS:
            from src.app.core.exceptions import InvalidPeriodTypeException

            raise InvalidPeriodTypeException(period_type)

    async def get_by_user_and_period(
        self, user_id: UUID, period_type: str, period_start: date
    ) -> Aggregate | None:
        """Fetch an aggregate by user, period type, and start date."""
        self.validate_period_type(period_type)
        try:
            statement = select(Aggregate).where(
                and_(
                    Aggregate.user_id == user_id,
                    Aggregate.period_type == period_type,
                    Aggregate.period_start == period_start,
                )
            )
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to fetch aggregate",
                user_id=str(user_id),
                period_type=period_type,
                period_start=str(period_start),
                error=str(e),
            )
            raise DatabaseException(
                "Aggregate lookup failed", "AGGREGATE_FETCH_FAILED"
            ) from e

    async def list_by_user(
        self,
        user_id: UUID,
        period_type: str,
        start_date: date | None = None,
        end_date: date | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Aggregate]:
        """List aggregates for a user with filters."""

        self.validate_period_type(period_type)
        try:
            statement = select(Aggregate).where(
                and_(
                    Aggregate.user_id == user_id,
                    Aggregate.period_type == period_type,
                )
            )

            if start_date:
                statement = statement.where(Aggregate.period_start >= start_date)
            if end_date:
                statement = statement.where(Aggregate.period_start <= end_date)

            statement = statement.offset(offset).limit(limit)
            result = await self.session.exec(statement)
            return list(result.all())
        except SQLAlchemyError as e:
            raise DatabaseException(
                "Failed to list aggregates", "AGGREGATE_LIST_FAILED"
            ) from e
