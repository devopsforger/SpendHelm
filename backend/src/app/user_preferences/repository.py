"""Repository for managing user preferences in the database."""

from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.core.exceptions import (
    DatabaseException,
)
from src.app.core.logger import get_logger
from src.app.user_preferences.model import UserPreference

logger = get_logger()


class UserPreferenceRepository:
    """Repository for managing user preferences in the database."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_user_id(self, user_id: UUID) -> UserPreference | None:
        """Fetch user preferences by user ID."""
        try:
            statement = select(UserPreference).where(UserPreference.user_id == user_id)
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to fetch preferences by user ID",
                user_id=str(user_id),
                error=str(e),
            )
            raise DatabaseException(
                "Preference lookup failed", "PREFERENCE_FETCH_FAILED"
            ) from e

    async def create(self, preference: UserPreference) -> UserPreference:
        """Create new user preferences."""
        try:
            self.session.add(preference)
            await self.session.commit()
            await self.session.refresh(preference)
            logger.info("User preferences created", user_id=str(preference.user_id))
            return preference
        except IntegrityError as e:
            await self.session.rollback()
            orig_msg = str(e.orig).lower() if e.orig else ""
            if "unique" in orig_msg and "user_id" in orig_msg:
                # Should not happen if service ensures one-to-one
                raise DatabaseException(
                    "User preferences already exist", "PREFERENCE_ALREADY_EXISTS"
                ) from e
            raise DatabaseException(
                "Preference creation integrity error", "PREFERENCE_CREATE_INTEGRITY"
            ) from e
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error("Preference creation DB error", error=str(e))
            raise DatabaseException(
                "Preference creation failed", "PREFERENCE_CREATE_FAILED"
            ) from e

    async def update(self, preference: UserPreference) -> UserPreference:
        """Update existing user preferences."""
        try:
            self.session.add(preference)
            await self.session.commit()
            await self.session.refresh(preference)
            return preference
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Preference update failed", "PREFERENCE_UPDATE_FAILED"
            ) from e

    async def delete(self, preference: UserPreference) -> None:
        """Delete user preferences (rarely used)."""
        try:
            await self.session.delete(preference)
            await self.session.commit()
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Preference deletion failed", "PREFERENCE_DELETE_FAILED"
            ) from e
