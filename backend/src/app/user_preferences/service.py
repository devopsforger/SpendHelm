# src/app/user_preferences/service.py
"""Service layer for managing user preferences."""

from uuid import UUID

from src.app.auth.model import User
from src.app.core.exceptions import (
    PreferenceCurrencyInvalidException,
    PreferenceNotFoundException,
)
from src.app.core.utils import is_valid_currency
from src.app.user_preferences.model import UserPreference
from src.app.user_preferences.repository import UserPreferenceRepository
from src.app.user_preferences.schemas import UserPreferenceCreate, UserPreferenceUpdate


class UserPreferenceService:
    """Service layer for managing user preferences."""

    def __init__(self, repo: UserPreferenceRepository):
        self.repo = repo

    async def get_preferences(
        self, requesting_user: User, target_user_id: UUID
    ) -> UserPreference:
        """
        Retrieve preferences for a user.

        Only the user themselves or an admin can access preferences.
        """
        if not (requesting_user.is_admin or requesting_user.id == target_user_id):
            from src.app.core.exceptions import PermissionDeniedException

            raise PermissionDeniedException(action="view", resource="user_preferences")

        preference = await self.repo.get_by_user_id(target_user_id)
        if not preference:
            raise PreferenceNotFoundException(target_user_id)
        return preference

    async def create_preferences(
        self, user_id: UUID, data: UserPreferenceCreate
    ) -> UserPreference:
        """Create preferences for a user (e.g., on first login)."""
        if not is_valid_currency(data.currency):
            raise PreferenceCurrencyInvalidException(data.currency)

        preference = UserPreference(
            user_id=user_id,
            currency=data.currency.upper(),
            timezone=data.timezone,
        )
        return await self.repo.create(preference)

    async def update_preferences(
        self, requesting_user: User, target_user_id: UUID, data: UserPreferenceUpdate
    ) -> UserPreference:
        """
        Update user preferences.

        Only the user themselves or an admin can update.
        """
        if not (requesting_user.is_admin or requesting_user.id == target_user_id):
            from src.app.core.exceptions import PermissionDeniedException

            raise PermissionDeniedException(
                action="update", resource="user_preferences"
            )

        preference = await self.get_preferences(requesting_user, target_user_id)

        if not is_valid_currency(data.currency):
            raise PreferenceCurrencyInvalidException(data.currency)

        preference.currency = data.currency.upper()
        preference.timezone = data.timezone

        return await self.repo.update(preference)

    async def ensure_preferences_exist(self, user_id: UUID) -> UserPreference:
        """
        Ensure a user has preferences; create defaults if missing.

        Useful during onboarding.
        """
        preference = await self.repo.get_by_user_id(user_id)
        if not preference:
            # Default to USD and UTC if none exist
            default_data = UserPreferenceCreate(currency="USD", timezone="UTC")
            preference = await self.create_preferences(user_id, default_data)
        return preference
