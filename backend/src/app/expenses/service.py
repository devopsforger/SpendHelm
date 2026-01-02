"""Service layer for managing expenses."""

from datetime import date
from decimal import Decimal
from uuid import UUID

from src.app.auth.model import User
from src.app.categories.service import CategoryService
from src.app.core.exceptions import (
    ExpenseAmountInvalidException,
    ExpenseCategoryMismatchException,
    ExpenseCurrencyInvalidException,
    ExpenseNotFoundException,
)
from src.app.core.utils import is_valid_currency
from src.app.expenses.model import Expense
from src.app.expenses.repository import ExpenseRepository
from src.app.expenses.schemas import ExpenseCreate, ExpenseUpdate


class ExpenseService:
    """Service layer for managing expenses."""

    def __init__(self, repo: ExpenseRepository, category_service: CategoryService):
        self.repo = repo
        self.category_service = category_service

    async def create_expense(self, user: User, data: ExpenseCreate) -> Expense:
        """Create a new expense for the user with idempotency."""
        # Idempotency check
        existing = await self.repo.get_by_request_id(data.request_id, user.id)
        if existing:
            return existing

        # Validate amount
        if data.amount <= Decimal("0"):
            raise ExpenseAmountInvalidException(str(data.amount))

        # Validate currency (you can replace with your own logic)
        if not is_valid_currency(data.currency):
            raise ExpenseCurrencyInvalidException(data.currency)

        # Ensure user has access to the category
        category = await self.category_service.get_category(user, data.category_id)
        if not category:
            # Should not happen due to FK, but safe
            raise ExpenseCategoryMismatchException(data.category_id)

        expense = Expense(
            user_id=user.id,
            category_id=data.category_id,
            amount=data.amount,
            currency=data.currency.upper(),
            expense_date=data.expense_date,
            note=data.note,
            request_id=data.request_id,
            is_deleted=False,
        )
        return await self.repo.create(expense)

    async def get_expense(self, user: User, expense_id: UUID) -> Expense:
        """Retrieve an expense by ID, ensuring user ownership."""
        expense = await self.repo.get_by_id(expense_id, user.id)
        if not expense:
            raise ExpenseNotFoundException(expense_id)
        return expense

    async def update_expense(
        self, user: User, expense_id: UUID, data: ExpenseUpdate
    ) -> Expense:
        """Update an existing expense."""
        expense = await self.get_expense(user, expense_id)

        # Validate incoming data
        if data.amount is not None and data.amount <= Decimal("0"):
            raise ExpenseAmountInvalidException(str(data.amount))

        if data.currency is not None and not is_valid_currency(data.currency):
            raise ExpenseCurrencyInvalidException(data.currency)

        # Category change: verify access
        if data.category_id and data.category_id != expense.category_id:
            category = await self.category_service.get_category(user, data.category_id)
            if not category:
                raise ExpenseCategoryMismatchException(data.category_id)

        # Apply updates
        update_data = data.dict(exclude_unset=True)
        for field, value in update_data.items():
            if value is not None:
                setattr(expense, field, value.upper() if field == "currency" else value)

        return await self.repo.update(expense)

    async def delete_expense(self, user: User, expense_id: UUID) -> None:
        """Soft-delete an expense."""
        expense = await self.get_expense(user, expense_id)
        await self.repo.delete_soft(expense)

    async def list_expenses(
        self,
        user: User,
        start_date: date | None = None,
        end_date: date | None = None,
        category_id: UUID | None = None,
        offset: int = 0,
        limit: int = 100,
    ) -> list[Expense]:
        """List user's expenses with optional filters."""
        if category_id:
            # Ensure user can access this category
            await self.category_service.get_category(user, category_id)
        return await self.repo.list_by_user(
            user_id=user.id,
            start_date=start_date,
            end_date=end_date,
            category_id=category_id,
            offset=offset,
            limit=limit,
        )
