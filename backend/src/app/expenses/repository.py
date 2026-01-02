"""Repository for managing expenses in the database."""

from datetime import date
from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import and_, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.core.exceptions import (
    DatabaseException,
    DuplicateResourceException,
)
from src.app.core.logger import get_logger
from src.app.expenses.model import Expense

logger = get_logger()


class ExpenseRepository:
    """Repository for managing expenses in the database."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, expense_id: UUID, user_id: UUID) -> Expense | None:
        """Fetch an expense by ID for a specific user (excludes soft-deleted)."""
        try:
            statement = select(Expense).where(
                and_(
                    Expense.id == expense_id,
                    Expense.user_id == user_id,
                    Expense.is_deleted.is_(False),
                )
            )
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to fetch expense by ID",
                expense_id=str(expense_id),
                user_id=str(user_id),
                error=str(e),
            )
            raise DatabaseException(
                "Expense lookup failed", "EXPENSE_FETCH_FAILED"
            ) from e

    async def get_by_request_id(
        self, request_id: UUID, user_id: UUID
    ) -> Expense | None:
        """Fetch an expense by idempotency key for a user."""
        try:
            statement = select(Expense).where(
                and_(
                    Expense.request_id == request_id,
                    Expense.user_id == user_id,
                )
            )
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to fetch expense by request_id",
                request_id=str(request_id),
                error=str(e),
            )
            raise DatabaseException(
                "Idempotency lookup failed", "EXPENSE_IDEMPOTENCY_LOOKUP_FAILED"
            ) from e

    async def create(self, expense: Expense) -> Expense:
        """Create a new expense in the database."""
        try:
            self.session.add(expense)
            await self.session.commit()
            await self.session.refresh(expense)
            logger.info("Expense created", expense_id=str(expense.id))
            return expense
        except IntegrityError as e:
            await self.session.rollback()
            orig_msg = str(e.orig).lower() if e.orig else ""
            if "uq_expense_idempotency" in orig_msg:
                raise DuplicateResourceException(
                    resource="Expense",
                    identifier=str(expense.request_id),
                    error_code="EXPENSE_IDEMPOTENCY_CONFLICT",
                ) from e
            raise DatabaseException(
                "Expense creation integrity error", "EXPENSE_CREATE_INTEGRITY"
            ) from e
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error("Expense creation DB error", error=str(e))
            raise DatabaseException(
                "Expense creation failed", "EXPENSE_CREATE_FAILED"
            ) from e

    async def update(self, expense: Expense) -> Expense:
        """Update an existing expense in the database."""
        try:
            self.session.add(expense)
            await self.session.commit()
            await self.session.refresh(expense)
            return expense
        except IntegrityError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Expense update integrity error", "EXPENSE_UPDATE_INTEGRITY"
            ) from e
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Expense update failed", "EXPENSE_UPDATE_FAILED"
            ) from e

    async def delete_soft(self, expense: Expense) -> None:
        """Soft-delete an expense by setting is_deleted=True."""
        try:
            expense.is_deleted = True
            self.session.add(expense)
            await self.session.commit()
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Expense soft-delete failed", "EXPENSE_SOFT_DELETE_FAILED"
            ) from e

    async def list_by_user(
        self,
        user_id: UUID,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: UUID | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Expense]:
        """List non-deleted expenses for a user with optional filters."""
        try:
            statement = select(Expense).where(
                and_(
                    Expense.user_id == user_id,
                    Expense.is_deleted.is_(False),
                )
            )

            if start_date:
                statement = statement.where(Expense.expense_date >= start_date)
            if end_date:
                statement = statement.where(Expense.expense_date <= end_date)
            if category_id:
                statement = statement.where(Expense.category_id == category_id)

            statement = statement.offset(offset).limit(limit)
            result = await self.session.exec(statement)
            return list(result.all())
        except SQLAlchemyError as e:
            raise DatabaseException(
                "Failed to list expenses", "EXPENSE_LIST_FAILED"
            ) from e

    async def count_user_expenses(self, user_id: UUID) -> int:
        """Count non-deleted expenses for a user."""
        try:
            statement = (
                select(func.count())
                .select_from(Expense)
                .where(
                    and_(
                        Expense.user_id == user_id,
                        Expense.is_deleted.is_(False),
                    )
                )
            )
            result = await self.session.exec(statement)
            return result.one()
        except SQLAlchemyError as e:
            raise DatabaseException(
                "Expense count failed", "EXPENSE_COUNT_FAILED"
            ) from e
