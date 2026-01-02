"""Database model for expense categories."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship, Column, func
from sqlalchemy import (
    DateTime,
    String,
    UniqueConstraint,
)


class Category(SQLModel, table=True):
    """Database model for expense categories."""

    __tablename__ = "categories"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID | None = Field(
        foreign_key="users.id",
        nullable=True,
        index=True,
    )

    name: str = Field(sa_column=Column(String(100), nullable=False))

    is_default: bool = Field(default=False, nullable=False)

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

    user: "User" = Relationship(
        back_populates="categories", sa_relationship={"argument": "user"}
    )
    expenses: list["Expense"] = Relationship(
        back_populates="category", sa_relationship={"argument": "expenses"}
    )

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_category_user_name"),
    )
