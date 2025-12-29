"""Database model for application users."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Optional, List
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship, Column, func
from sqlalchemy import (
    DateTime,
    String,
)


class User(SQLModel, table=True):
    """Database model for application users."""

    __tablename__ = "users"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    email: str = Field(
        sa_column=Column(String(255), nullable=False, unique=True, index=True)
    )

    password_hash: str = Field(nullable=False)

    is_active: bool = Field(default=True, nullable=False)

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

    # Relationships
    preferences: Optional["UserPreference"] = Relationship(back_populates="user")
    categories: List["Category"] = Relationship(back_populates="user")
    expenses: List["Expense"] = Relationship(back_populates="user")
    refresh_tokens: List["RefreshToken"] = Relationship(back_populates="user")
