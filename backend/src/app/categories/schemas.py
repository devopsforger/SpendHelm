"""Schemas for expense categories."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class CategoryBase(BaseModel):
    """Base schema for expense categories."""

    name: str = Field(..., min_length=1, max_length=100)


class CategoryCreate(CategoryBase):
    """Schema for creating a new expense category."""


class CategoryUpdate(CategoryBase):
    """Schema for updating an existing expense category."""


class CategoryRead(CategoryBase):
    """Schema for reading an expense category."""

    id: UUID
    user_id: UUID | None
    is_default: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration to enable ORM mode."""

        from_attributes = True
