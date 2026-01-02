"""Database model for user preferences."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import SQLModel, Field, Relationship, Column, func
from sqlalchemy import (
    DateTime,
    String,
)


class UserPreference(SQLModel, table=True):
    """Database model for user preferences."""

    __tablename__ = "user_preferences"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, unique=True)

    currency: str = Field(sa_column=Column(String(3), nullable=False))

    timezone: str = Field(sa_column=Column(String(64), nullable=False))

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
        back_populates="preferences", sa_relationship={"argument": "user_preferences"}
    )
