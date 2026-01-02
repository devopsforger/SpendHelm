"""User preferences API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.dependencies import get_current_user, require_admin
from src.app.auth.model import User
from src.app.core.database import get_db
from src.app.user_preferences.repository import UserPreferenceRepository
from src.app.user_preferences.schemas import (
    UserPreferenceCreate,
    UserPreferenceRead,
    UserPreferenceUpdate,
)
from src.app.user_preferences.service import UserPreferenceService

router = APIRouter(prefix="/api/v1/preferences", tags=["User Preferences"])


def get_preference_service(
    session: AsyncSession = Depends(get_db),
) -> UserPreferenceService:
    """Dependency to get UserPreferenceService instance."""
    repo = UserPreferenceRepository(session)
    return UserPreferenceService(repo)


@router.get("/me", response_model=UserPreferenceRead)
async def get_my_preferences(
    current_user: User = Depends(get_current_user),
    service: UserPreferenceService = Depends(get_preference_service),
):
    """Get current user's preferences."""
    return await service.get_preferences(current_user, current_user.id)


@router.get("/{user_id}", response_model=UserPreferenceRead)
async def get_user_preferences(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    service: UserPreferenceService = Depends(get_preference_service),
):
    """Get preferences for a specific user (admin-only unless self)."""
    return await service.get_preferences(current_user, user_id)


@router.put("/me", response_model=UserPreferenceRead)
async def update_my_preferences(
    data: UserPreferenceUpdate,
    current_user: User = Depends(get_current_user),
    service: UserPreferenceService = Depends(get_preference_service),
):
    """Update current user's preferences."""
    return await service.update_preferences(current_user, current_user.id, data)


@router.put("/{user_id}", response_model=UserPreferenceRead)
async def admin_update_user_preferences(
    user_id: UUID,
    data: UserPreferenceUpdate,
    current_user: User = Depends(require_admin),
    service: UserPreferenceService = Depends(get_preference_service),
):
    """Update another user's preferences (admin-only)."""
    return await service.update_preferences(current_user, user_id, data)


@router.post(
    "/initialize",
    response_model=UserPreferenceRead,
    status_code=status.HTTP_201_CREATED,
)
async def initialize_preferences(
    data: UserPreferenceCreate,
    current_user: User = Depends(get_current_user),
    service: UserPreferenceService = Depends(get_preference_service),
):
    """
    Initialize preferences for the current user (idempotent).

    Typically called during onboarding if not auto-created.
    """
    return await service.create_preferences(current_user.id, data)
