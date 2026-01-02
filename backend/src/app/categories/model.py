"""Database model for expense categories."""

from __future__ import annotations

import datetime as dt_mod
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    String,
    UniqueConstraint,
)
from sqlmodel import Column, Field, Relationship, SQLModel


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
        back_populates="categories", sa_relationship={"argument": "user"}
    )
    expenses: list["Expense"] = Relationship(
        back_populates="category", sa_relationship={"argument": "expenses"}
    )

    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_category_user_name"),
    )
