"""Database model for application users."""

from __future__ import annotations

import datetime as dt_mod
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    String,
)
from sqlmodel import Column, Field, Relationship, SQLModel


class User(SQLModel, table=True):
    """Database model for application users."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    email: str = Field(
        sa_column=Column(String(255), nullable=False, unique=True, index=True)
    )

    password_hash: str = Field(nullable=False)

    is_active: bool = Field(default=True, nullable=False)
    is_admin: bool = Field(default=False, nullable=False)

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

    # Relationships
    preferences: "UserPreference" = Relationship(
        back_populates="user", sa_relationship={"argument": "user_preferences"}
    )
    categories: list["Category"] = Relationship(
        back_populates="user", sa_relationship={"argument": "categories"}
    )
    expenses: list["Expense"] = Relationship(
        back_populates="user", sa_relationship={"argument": "expenses"}
    )
    refresh_tokens: list["RefreshToken"] = Relationship(
        back_populates="user", sa_relationship={"argument": "refresh_tokens"}
    )
