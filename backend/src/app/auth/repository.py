"""
Authentication repository.

Responsible strictly for persistence operations related to authentication.
No business logic, no validation, no hashing, no authorization decisions.

This repository:
- Handles database errors explicitly
- Rolls back transactions on failure
- Emits structured logs
- Raises domain-specific exceptions only
"""

from uuid import UUID

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import and_, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.model import User
from src.app.core.exceptions import (
    DatabaseException,
    EmailAlreadyInUseException,
    UserNotFoundException,
)
from src.app.core.logger import get_logger
from src.app.models.refresh_token_model import RefreshToken

logger = get_logger()


class AuthRepository:
    """
    Repository for authentication-related database operations.

    This class is intentionally dumb:
    - It assumes data has already been validated
    - It assumes passwords are already hashed
    - It only persists and retrieves records safely
    """

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # ──────────────────────────────────────────────────────────────
    # User queries
    # ──────────────────────────────────────────────────────────────

    async def get_user_by_email(self, email: str) -> User | None:
        """
        Retrieve a user by email address.

        Args:
            email (str): User email.

        Returns:
            User | None: User if found, otherwise None.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(User).where(User.email == email)
            result = await self.session.exec(statement)  # pyright: ignore[reportGeneralTypeIssues]
            return result.first()

        except SQLAlchemyError as exc:
            logger.error(
                "Failed to retrieve user by email",
                email=email,
                error=str(exc),
            )
            raise DatabaseException(
                message="Failed to retrieve user by email",
                error_code="USER_EMAIL_LOOKUP_FAILED",
                original_error=str(exc),
            ) from exc

    async def get_user_by_id(self, user_id: UUID) -> User | None:
        """
        Retrieve a user by ID.

        Args:
            user_id (UUID): User identifier.

        Returns:
            User | None: User if found, otherwise None.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(User).where(User.id == user_id)
            result = await self.session.exec(statement)
            return result.first()

        except SQLAlchemyError as exc:
            logger.error(
                "Failed to retrieve user by id",
                user_id=str(user_id),
                error=str(exc),
            )
            raise DatabaseException(
                message="Failed to retrieve user",
                error_code="USER_ID_LOOKUP_FAILED",
                original_error=str(exc),
            ) from exc

    async def list_users(
        self,
        *,
        offset: int = 0,
        limit: int = 100,
        is_active: bool | None = None,
    ) -> list[User]:
        """
        List users with optional filtering.

        Args:
            offset (int): Pagination offset.
            limit (int): Pagination limit.
            is_active (bool | None): Optional active filter.

        Returns:
            list[User]: Users list.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(User)

            if is_active is not None:
                statement = statement.where(User.is_active == is_active)

            statement = statement.offset(offset).limit(limit)
            result = await self.session.exec(statement)

            return list(result.all())

        except Exception as exc:
            raise DatabaseException(
                message="Failed to list users",
                error_code="USER_LIST_FAILED",
                original_error=str(exc),
            ) from exc

    # ──────────────────────────────────────────────────────────────
    # User persistence
    # ──────────────────────────────────────────────────────────────

    async def create_user(self, user: User) -> User:
        """
        Persist a new user.

        Assumes:
        - Email is validated
        - Password is already hashed

        Args:
            user (User): Prepared user entity.

        Returns:
            User: Persisted user.

        Raises:
            EmailAlreadyInUseException: On duplicate email.
            DatabaseException: On any other database failure.
        """
        try:
            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)

            logger.info("User created", user_id=str(user.id))
            return user

        except IntegrityError as exc:
            await self.session.rollback()

            error_msg = str(exc.orig).lower() if exc.orig else ""
            if "email" in error_msg:
                logger.warning(
                    "Duplicate email during user creation",
                    email=user.email,
                )
                raise EmailAlreadyInUseException(user.email) from exc

            logger.error(
                "Integrity error during user creation",
                error=str(exc),
            )
            raise DatabaseException(
                message="User creation failed due to integrity constraint",
                error_code="USER_CREATE_CONSTRAINT_FAILED",
                original_error=str(exc),
            ) from exc

        except SQLAlchemyError as exc:
            await self.session.rollback()

            logger.error(
                "Database error during user creation",
                error=str(exc),
            )
            raise DatabaseException(
                message="User creation failed",
                error_code="USER_CREATE_FAILED",
                original_error=str(exc),
            ) from exc

    # ──────────────────────────────────────────────────────────────
    # Updating a user
    # ──────────────────────────────────────────────────────────────

    async def update_user(self, user_id: UUID, updates: dict) -> User:
        """
        Update an existing user.

        Args:
            user_id (UUID): User identifier.
            updates (dict): Fields to update (already validated).

        Returns:
            User: Updated user entity.

        Raises:
            UserNotFoundException: If user does not exist.
            EmailAlreadyInUseException: If email conflicts.
            DatabaseException: On database failure.
        """
        try:
            user = await self.get_user_by_id(user_id)
            if not user:
                raise UserNotFoundException(user_id)

            for field, value in updates.items():
                setattr(user, field, value)

            self.session.add(user)
            await self.session.commit()
            await self.session.refresh(user)

            logger.info("User updated", user_id=str(user.id))
            return user

        except IntegrityError as exc:
            await self.session.rollback()

            error_msg = str(exc.orig).lower() if exc.orig else ""
            if "email" in updates:
                new_email = updates["email"]
                if isinstance(new_email, str) and "email" in error_msg.lower():
                    raise EmailAlreadyInUseException(new_email) from exc

            raise DatabaseException(
                message="User update failed due to integrity constraint",
                error_code="USER_UPDATE_CONSTRAINT_FAILED",
                original_error=str(exc),
            ) from exc

        except DatabaseException:
            raise

        except Exception as exc:
            await self.session.rollback()
            raise DatabaseException(
                message="User update failed",
                error_code="USER_UPDATE_FAILED",
                original_error=str(exc),
            ) from exc

    # ──────────────────────────────────────────────────────────────
    # Handle user deletion
    # ──────────────────────────────────────────────────────────────
    async def delete_user_and_tokens(self, user_id: UUID) -> None:
        """
        Permanently delete a user and revoke all refresh tokens.

        WARNING:
        Use only when hard deletion is required.

        Args:
            user_id (UUID): User identifier.

        Raises:
            UserNotFoundException: If user does not exist.
            DatabaseException: On database failure.
        """
        try:
            user = await self.get_user_by_id(user_id)
            if not user:
                raise UserNotFoundException(user_id)

            tokens = await self.list_refresh_tokens_for_user(user_id)
            for token in tokens:
                await self.session.delete(token)

            await self.session.delete(user)
            await self.session.commit()

            logger.warning(
                "User permanently deleted",
                user_id=str(user_id),
                revoked_tokens=len(tokens),
            )

        except DatabaseException:
            raise

        except Exception as exc:
            await self.session.rollback()
            raise DatabaseException(
                message="User deletion failed",
                error_code="USER_DELETE_FAILED",
                original_error=str(exc),
            ) from exc

    # ──────────────────────────────────────────────────────────────
    # Refresh token handling
    # ──────────────────────────────────────────────────────────────

    async def save_refresh_token(self, token: RefreshToken) -> None:
        """
        Persist a refresh token.

        Args:
            token (RefreshToken): Refresh token entity.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            self.session.add(token)
            await self.session.commit()

            logger.debug(
                "Refresh token stored",
                user_id=str(token.user_id),
            )

        except SQLAlchemyError as exc:
            await self.session.rollback()

            logger.error(
                "Failed to store refresh token",
                user_id=str(token.user_id),
                error=str(exc),
            )
            raise DatabaseException(
                message="Failed to store refresh token",
                error_code="REFRESH_TOKEN_STORE_FAILED",
                original_error=str(exc),
            ) from exc

    async def get_refresh_token_by_hash(self, token_hash: str) -> RefreshToken | None:
        """
        Retrieve a refresh token by its hashed value.

        Args:
            token_hash (str): Hashed token value.

        Returns:
            RefreshToken | None: Token if found.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(RefreshToken).where(
                RefreshToken.token_hash == token_hash
            )
            result = await self.session.exec(statement)
            return result.first()

        except SQLAlchemyError as exc:
            logger.error(
                "Failed to retrieve refresh token",
                error=str(exc),
            )
            raise DatabaseException(
                message="Refresh token lookup failed",
                error_code="REFRESH_TOKEN_LOOKUP_FAILED",
                original_error=str(exc),
            ) from exc

    async def list_refresh_tokens_for_user(self, user_id: UUID) -> list[RefreshToken]:
        """
        List all refresh tokens for a user.

        Args:
            user_id (UUID): User identifier.

        Returns:
            list[RefreshToken]: User refresh tokens.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(RefreshToken).where(RefreshToken.user_id == user_id)
            result = await self.session.exec(statement)
            return list(result.all())

        except Exception as exc:
            raise DatabaseException(
                message="Failed to list refresh tokens",
                error_code="REFRESH_TOKEN_LIST_FAILED",
                original_error=str(exc),
            ) from exc

    async def delete_refresh_token(self, token: RefreshToken) -> None:
        """
        Delete a single refresh token.

        Args:
            token (RefreshToken): Token entity.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            await self.session.delete(token)
            await self.session.commit()

            logger.debug(
                "Refresh token deleted",
                token_id=str(token.id),
            )

        except SQLAlchemyError as exc:
            await self.session.rollback()

            logger.error(
                "Failed to delete refresh token",
                token_id=str(token.id),
                error=str(exc),
            )
            raise DatabaseException(
                message="Refresh token deletion failed",
                error_code="REFRESH_TOKEN_DELETE_FAILED",
                original_error=str(exc),
            ) from exc

    async def delete_all_refresh_tokens_for_user(self, user_id: UUID) -> None:
        """
        Revoke all refresh tokens for a user.

        Used during:
        - Logout all sessions
        - Password reset
        - Account compromise response

        Args:
            user_id (UUID): User identifier.

        Raises:
            DatabaseException: On database failure.
        """
        try:
            statement = select(RefreshToken).where(RefreshToken.user_id == user_id)
            result = await self.session.exec(statement)
            tokens = result.all()

            for token in tokens:
                await self.session.delete(token)

            await self.session.commit()

            logger.info(
                "All refresh tokens revoked",
                user_id=str(user_id),
                count=len(tokens),
            )

        except SQLAlchemyError as exc:
            await self.session.rollback()

            logger.error(
                "Failed to revoke refresh tokens",
                user_id=str(user_id),
                error=str(exc),
            )
            raise DatabaseException(
                message="Failed to revoke refresh tokens",
                error_code="REFRESH_TOKEN_REVOKE_FAILED",
                original_error=str(exc),
            ) from exc

    async def count_active_admins(self) -> int:
        """
        Count active admin users (is_admin=True and is_active=True).

        Returns:
            int: Number of active admin users.

        Raises:
            DatabaseException: If a general database error occurs.
        """
        try:
            statement = select(func.count(User.id)).where(
                and_(
                    User.is_admin,
                    User.is_active,
                )
            )
            result = await self.session.exec(statement)
            count = result.one()
            logger.debug("Retrieved active admins count", count=count)
            return count
        except Exception as e:
            raise DatabaseException(
                message="Active admins count retrieval failed",
                error_code="ACTIVE_ADMINS_COUNT_FAILED",
                original_error=str(e),
            ) from e
