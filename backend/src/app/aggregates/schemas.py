"""Schemas for expense aggregates."""

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, Field


class AggregateRead(BaseModel):
    """Schema for reading expense aggregates."""

    id: UUID
    user_id: UUID
    period_type: str = Field(..., pattern=r"^(daily|weekly|monthly)$")
    period_start: date
    total_amount: Decimal
    currency: str = Field(..., min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration to enable ORM mode."""

        from_attributes = True


class AggregateFilter(BaseModel):
    """Schema for filtering aggregates."""

    period_type: str = Field(..., pattern=r"^(daily|weekly|monthly)$")
    start_date: date | None = None
    end_date: date | None = None
