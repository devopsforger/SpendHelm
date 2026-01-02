"""Expense API routes."""

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi_pagination import LimitOffsetPage, LimitOffsetParams, paginate
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.dependencies import get_current_user
from src.app.auth.model import User
from src.app.categories.repository import CategoryRepository
from src.app.categories.service import CategoryService
from src.app.core.database import get_db
from src.app.expenses.repository import ExpenseRepository
from src.app.expenses.schemas import ExpenseCreate, ExpenseRead, ExpenseUpdate
from src.app.expenses.service import ExpenseService

router = APIRouter(prefix="/api/v1/expenses", tags=["Expenses"])


def get_expense_service(session: AsyncSession = Depends(get_db)) -> ExpenseService:
    """Dependency to get ExpenseService instance."""
    repo = ExpenseRepository(session)
    category_service = CategoryService(
        CategoryRepository(session)
    )  # Or better: inject properly
    return ExpenseService(repo, category_service)


@router.post("/", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
async def create_expense(
    data: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service),
):
    """Create a new expense with idempotency support."""
    return await service.create_expense(current_user, data)


@router.get("/{expense_id}", response_model=ExpenseRead)
async def get_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service),
):
    """Get an expense by ID."""
    return await service.get_expense(current_user, expense_id)


@router.patch("/{expense_id}", response_model=ExpenseRead)
async def update_expense(
    expense_id: UUID,
    data: ExpenseUpdate,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service),
):
    """Update an existing expense."""
    return await service.update_expense(current_user, expense_id, data)


@router.delete("/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_expense(
    expense_id: UUID,
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service),
):
    """Soft-delete an expense."""
    await service.delete_expense(current_user, expense_id)


@router.get("/", response_model=LimitOffsetPage[ExpenseRead])
async def list_expenses(
    start_date: date | None = None,
    end_date: date | None = None,
    category_id: UUID | None = None,
    params: LimitOffsetParams = Depends(),
    current_user: User = Depends(get_current_user),
    service: ExpenseService = Depends(get_expense_service),
):
    """List user's expenses with optional date/category filters."""
    expenses = await service.list_expenses(
        user=current_user,
        start_date=start_date,
        end_date=end_date,
        category_id=category_id,
        offset=params.offset,
        limit=params.limit,
    )
    return paginate(expenses, params)
