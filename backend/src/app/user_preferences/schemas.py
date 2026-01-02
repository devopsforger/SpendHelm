"""Schemas for user preferences management."""

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UserPreferenceBase(BaseModel):
    """Base schema for user preferences."""

    currency: str = Field(..., min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
    timezone: str = Field(..., min_length=1, max_length=64)


class UserPreferenceCreate(UserPreferenceBase):
    """Schema for creating user preferences (typically done automatically)."""


class UserPreferenceUpdate(UserPreferenceBase):
    """Schema for updating user preferences."""


class UserPreferenceRead(UserPreferenceBase):
    """Schema for reading user preferences."""

    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        """Pydantic configuration to enable ORM mode."""

        from_attributes = True
