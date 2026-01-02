"""Database model for user expense aggregates."""

from __future__ import annotations

import datetime as dt_mod
from datetime import date, datetime
from decimal import Decimal
from uuid import UUID, uuid4

from sqlalchemy import (
    DateTime,
    Numeric,
    String,
    UniqueConstraint,
)
from sqlmodel import (
    Column,
    Field,
    SQLModel,
)


class Aggregate(SQLModel, table=True):
    """Database model for user expense aggregates."""

    __tablename__ = "aggregates"

    id: UUID = Field(default_factory=uuid4, primary_key=True)

    user_id: UUID = Field(foreign_key="users.id", nullable=False, index=True)

    period_type: str = Field(
        sa_column=Column(String(16), nullable=False)
    )  # daily / weekly / monthly

    period_start: date = Field(nullable=False, index=True)

    total_amount: Decimal = Field(sa_column=Column(Numeric(14, 2), nullable=False))

    currency: str = Field(sa_column=Column(String(3), nullable=False))

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

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "period_type",
            "period_start",
            name="uq_aggregate_period",
        ),
    )
