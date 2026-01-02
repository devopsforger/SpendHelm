"""Database model for refresh tokens."""

from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID, uuid4

from sqlmodel import (
    SQLModel,
    Field,
    Relationship,
    Column,
)
from sqlalchemy import DateTime


class RefreshToken(SQLModel, table=True):
    """Database model for refresh tokens."""

    __tablename__ = "refresh_tokens"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    token_hash: str = Field(nullable=False, unique=True)

    expires_at: datetime = Field(
        sa_column=Column(DateTime(timezone=True), nullable=False)
    )

    is_revoked: bool = Field(default=False, nullable=False)

    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        sa_column=Column(DateTime(timezone=True), nullable=False),
    )

    user: "User" = Relationship(back_populates="refresh_tokens", sa_relationship={"argument": "user"})
