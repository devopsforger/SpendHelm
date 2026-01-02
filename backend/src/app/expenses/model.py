"""Expense model definition."""

from __future__ import annotations

import datetime as dt_mod
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Index,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlmodel import Column, Field, Relationship, SQLModel


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

    note: str | None = Field(sa_column=Column(String(255)))

    # Idempotency
    request_id: UUID = Field(nullable=False)

    # Soft delete
    is_deleted: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(dt_mod.UTC),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(dt_mod.UTC),
        sa_column=Column(
            DateTime(timezone=True),
            nullable=False,
            server_default="NOW()",
            onupdate="NOW()",
        ),
    )

    user: "User" = Relationship(
        back_populates="expenses", sa_relationship={"argument": "user"}
    )
    category: "Category" = Relationship(
        back_populates="expenses", sa_relationship={"argument": "category"}
    )

    __table_args__ = (
        UniqueConstraint("user_id", "request_id", name="uq_expense_idempotency"),
        Index("idx_expense_user_date", "user_id", "expense_date"),
    )
