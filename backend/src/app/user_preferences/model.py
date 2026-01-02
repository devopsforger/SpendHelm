"""Database model for user preferences."""

from __future__ import annotations

import datetime as dt_mod
from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    String,
)
from sqlmodel import Column, Field, Relationship, SQLModel


class UserPreference(SQLModel, table=True):
    """Database model for user preferences."""

    __tablename__ = "user_preferences"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, unique=True)

    currency: str = Field(sa_column=Column(String(3), nullable=False))

    timezone: str = Field(sa_column=Column(String(64), nullable=False))

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
        back_populates="preferences", sa_relationship={"argument": "user_preferences"}
    )
