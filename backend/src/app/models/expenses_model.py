from __future__ import annotations

from datetime import datetime, date, timezone
from decimal import Decimal
from typing import Optional
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship, Column, func
from sqlalchemy import (
    DateTime,
    Numeric,
    String,
    UniqueConstraint,
    Index,
)


class Expense(SQLModel, table=True):
    """
    Expense model representing an expense entry.
    """

    __tablename__ = "expenses"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)
    category_id: UUID = Field(foreign_key="categories.id", nullable=False, index=True)

    amount: Decimal = Field(sa_column=Column(Numeric(12, 2), nullable=False))

    currency: str = Field(sa_column=Column(String(3), nullable=False))

    expense_date: date = Field(nullable=False, index=True)

    note: Optional[str] = Field(sa_column=Column(String(255)))

    # Idempotency
    request_id: UUID = Field(nullable=False)

    # Soft delete
    is_deleted: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default=func.now(),
            onupdate=func.now(),
        )
    )

    user: "User" = Relationship(back_populates="expenses")
    category: "Category" = Relationship(back_populates="expenses")

    __table_args__ = (
        UniqueConstraint("user_id", "request_id", name="uq_expense_idempotency"),
        Index("idx_expense_user_date", "user_id", "expense_date"),
    )
