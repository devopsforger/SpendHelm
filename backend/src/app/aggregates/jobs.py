"""Background jobs for computing and upserting expense aggregates."""

from __future__ import annotations

import datetime as dt_mod
from datetime import date, datetime, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import and_, func, text
from sqlalchemy.exc import SQLAlchemyError
from sqlmodel import col, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.core.exceptions import DatabaseException
from src.app.core.logger import get_logger
from src.app.expenses.model import Expense
from src.app.user_preferences.repository import UserPreferenceRepository

logger = get_logger()


class AggregateManager:
    """
    Manages the computation and atomic upsert of expense aggregates.

    Aggregates are derived from expense data and stored per:
    - user
    - period type (daily, weekly, monthly)
    - period start date

    Uses PostgreSQL ON CONFLICT for safe, atomic upserts.
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def recompute_for_expense_date(
        self, user_id: UUID, expense_date: date
    ) -> None:
        """
        Recompute aggregates for all period types affected by an expense on a given date.

        Args:
            user_id (UUID): ID of the user whose aggregates to update.
            expense_date (date): Date of the expense that triggered recomputation.
        """
        logger.debug(
            "Recomputing aggregates for user",
            user_id=str(user_id),
            expense_date=str(expense_date),
        )

        # Daily: same date
        await self._compute_and_upsert_period(user_id, "daily", expense_date)

        # Weekly: ISO week (Monday = start)
        week_start = expense_date - timedelta(days=expense_date.weekday())
        await self._compute_and_upsert_period(user_id, "weekly", week_start)

        # Monthly: first day of month
        month_start = expense_date.replace(day=1)
        await self._compute_and_upsert_period(user_id, "monthly", month_start)

    async def _compute_and_upsert_period(
        self, user_id: UUID, period_type: str, period_start: date
    ) -> None:
        """
        Compute total expenses for a period and atomically upsert the aggregate.

        Args:
            user_id (UUID): User identifier.
            period_type (str): One of 'daily', 'weekly', 'monthly'.
            period_start (date): Start date of the period.
        """
        period_end = self._get_period_end(period_type, period_start)
        total_amount = await self._sum_expenses_in_period(
            user_id, period_start, period_end
        )
        currency = await self._get_user_currency(user_id)

        await self._upsert_aggregate(
            user_id=user_id,
            period_type=period_type,
            period_start=period_start,
            total_amount=total_amount,
            currency=currency,
        )

        logger.debug(
            "Aggregate upserted",
            user_id=str(user_id),
            period_type=period_type,
            period_start=str(period_start),
            total_amount=str(total_amount),
            currency=currency,
        )

    def _get_period_end(self, period_type: str, period_start: date) -> date:
        """
        Determine the end date of a period based on its type and start.

        Args:
            period_type (str): Period type ('daily', 'weekly', 'monthly').
            period_start (date): Start date of the period.

        Returns:
            date: Inclusive end date of the period.
        """
        if period_type == "daily":
            return period_start
        elif period_type == "weekly":
            return period_start + timedelta(days=6)
        elif period_type == "monthly":
            if period_start.month == 12:
                return period_start.replace(
                    year=period_start.year + 1, month=1, day=1
                ) - timedelta(days=1)
            else:
                return period_start.replace(
                    month=period_start.month + 1, day=1
                ) - timedelta(days=1)
        else:
            raise ValueError(f"Unsupported period_type: {period_type}")

    async def _sum_expenses_in_period(
        self, user_id: UUID, start: date, end: date
    ) -> Decimal:
        """
        Sum all non-deleted expenses for a user within a date range.

        Args:
            user_id (UUID): User identifier.
            start (date): Start date (inclusive).
            end (date): End date (inclusive).

        Returns:
            Decimal: Total amount, or 0.00 if no expenses.
        """
        try:
            statement = select(func.sum(Expense.amount)).where(
                and_(
                    col(Expense.user_id) == user_id,
                    col(Expense.is_deleted).is_(False),
                    col(Expense.expense_date) >= start,
                    col(Expense.expense_date) <= end,
                )
            )
            result = await self.session.execute(statement)
            total = result.scalar() or Decimal("0.00")
            return total.quantize(Decimal("0.01"))
        except SQLAlchemyError as e:
            logger.error(
                "Failed to sum expenses for aggregation",
                user_id=str(user_id),
                start=str(start),
                end=str(end),
                error=str(e),
            )
            raise DatabaseException(
                "Expense summation failed", "AGGREGATE_SUM_FAILED"
            ) from e

    async def _get_user_currency(self, user_id: UUID) -> str:
        """
        Retrieve the user's default currency from preferences.

        Falls back to 'USD' if preferences are missing.

        Args:
            user_id (UUID): User identifier.

        Returns:
            str: 3-letter uppercase currency code.
        """
        try:
            pref_repo = UserPreferenceRepository(self.session)
            preference = await pref_repo.get_by_user_id(user_id)
            return preference.currency if preference else "USD"
        except SQLAlchemyError:
            logger.warning(
                "Failed to load user currency, defaulting to USD", user_id=str(user_id)
            )
            return "USD"

    async def _upsert_aggregate(
        self,
        user_id: UUID,
        period_type: str,
        period_start: date,
        total_amount: Decimal,
        currency: str,
    ) -> None:
        """
        Atomically upsert an aggregate using PostgreSQL ON CONFLICT.

        Leverages the unique constraint: (user_id, period_type, period_start).

        Args:
            user_id (UUID): User identifier.
            period_type (str): Period type.
            period_start (date): Period start.
            total_amount (Decimal): Computed total.
            currency (str): Currency code.
        """
        now = datetime.now(dt_mod.UTC)
        try:
            await self.session.execute(
                text("""
                    INSERT INTO aggregates (
                        user_id,
                        period_type,
                        period_start,
                        total_amount,
                        currency,
                        created_at,
                        updated_at
                    ) VALUES (
                        :user_id,
                        :period_type,
                        :period_start,
                        :total_amount,
                        :currency,
                        :created_at,
                        :updated_at
                    )
                    ON CONFLICT (user_id, period_type, period_start)
                    DO UPDATE SET
                        total_amount = EXCLUDED.total_amount,
                        currency = EXCLUDED.currency,
                        updated_at = EXCLUDED.updated_at;
                """),
                {
                    "user_id": str(user_id),
                    "period_type": period_type,
                    "period_start": period_start,
                    "total_amount": total_amount,
                    "currency": currency,
                    "created_at": now,
                    "updated_at": now,
                },
            )
        except SQLAlchemyError as e:
            logger.error(
                "Failed to upsert aggregate",
                user_id=str(user_id),
                period_type=period_type,
                period_start=str(period_start),
                error=str(e),
            )
            raise DatabaseException(
                "Aggregate upsert failed", "AGGREGATE_UPSERT_FAILED"
            ) from e
