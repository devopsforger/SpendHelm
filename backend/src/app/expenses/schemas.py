"""Schemas for expense management."""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field, field_validator

from src.app.core.exceptions import ExpenseDateInFutureException


class ExpenseBase(BaseModel):
    """Base schema for expense attributes."""

    amount: Decimal = Field(..., gt=0, max_digits=12, decimal_places=2)
    currency: str = Field(..., min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    expense_date: date
    note: str | None = Field(None, max_length=255)
    category_id: UUID


class ExpenseCreate(ExpenseBase):
    """Schema for creating a new expense."""

    request_id: UUID

    @field_validator("expense_date")
    @classmethod
    def expense_date_not_in_future(cls, v: date) -> date:
        """Validator to ensure the expense date is not in the future."""
        from datetime import date as dt_date

        if v > dt_date.today():
            raise ExpenseDateInFutureException(str(v))
        return v


class ExpenseUpdate(BaseModel):
    """Schema for updating an existing expense."""

    amount: Decimal | None = Field(None, gt=0, max_digits=12, decimal_places=2)
    currency: str | None = Field(
        None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$"
    )
    expense_date: date | None = None
    note: str | None = Field(None, max_length=255)
    category_id: UUID | None = None

    @field_validator("expense_date")
    @classmethod
    def expense_date_not_in_future(cls, v: date | None) -> date | None:
        """Validator to ensure the expense date is not in the future."""
        if v and v > date.today():
            raise ExpenseDateInFutureException(str(v))
        return v


class ExpenseRead(ExpenseBase):
    """Schema for reading an expense."""

    id: UUID
    user_id: UUID
    request_id: UUID
    is_deleted: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration to enable ORM mode."""

        from_attributes = True
