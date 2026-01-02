"""
Authentication service layer.

Responsibilities:
- Enforce authentication and authorization rules
- Orchestrate repository operations
- Handle token lifecycle semantics
- Translate failures into domain exceptions

This service:
- Never touches the database session directly
- Never performs persistence logic
- Never swallows errors silently
"""

from datetime import datetime, timedelta
from uuid import UUID

from src.app.auth import security
from src.app.auth.model import User
from src.app.auth.repository import AuthRepository
from src.app.core.config import config
from src.app.core.exceptions import (
    AuthenticationFailedException,
    EmailAlreadyInUseException,
    InvalidTokenException,
    UserNotFoundException,
)
from src.app.models.refresh_token_model import RefreshToken


class AuthService:
    """Authentication use cases."""

    def __init__(self, repo: AuthRepository) -> None:
        self.repo = repo

    # ──────────────────────────────────────────────────────────────
    # Getting users
    # ──────────────────────────────────────────────────────────────

    async def list_users(
        self,
        *,
        offset: int = 0,
        limit: int = 100,
        is_active: bool | None = None,
    ) -> list[User]:
        """
        List users with optional filtering.

        Business rules:
        - Enforce sane pagination bounds
        """
        if offset < 0:
            offset = 0

        if limit <= 0:
            limit = 1
        elif limit > 500:
            limit = 500

        return await self.repo.list_users(
            offset=offset,
            limit=limit,
            is_active=is_active,
        )

    async def get_user_by_email_or_fail(self, email: str) -> User:
        """
        Retrieve a user by email or raise if not found.
        """
        user = await self.repo.get_user_by_email(email)
        if not user:
            raise UserNotFoundException(email)
        return user

    # ──────────────────────────────────────────────────────────────
    # Registration
    # ──────────────────────────────────────────────────────────────

    async def register_user(self, email: str, password: str) -> User:
        """
        Register a new user.

        Rules:
        - Email must be unique
        - Password must be hashed before persistence
        """
        existing = await self.repo.get_user_by_email(email)
        if existing:
            raise EmailAlreadyInUseException(email)

        user = User(
            email=email,
            password_hash=security.hash_password(password),
            is_active=True,
        )

        result = await self.repo.create_user(user)
        return result

    # ──────────────────────────────────────────────────────────────
    # Update users
    # ──────────────────────────────────────────────────────────────

    async def update_own_profile(
        self,
        user_id: UUID,
        *,
        email: str | None = None,
    ) -> User:
        """
        Update own profile (non-sensitive fields only).
        Called by regular users for self-updates.
        """
        if email is None:
            user = await self.repo.get_user_by_id(user_id)
            if not user:
                raise UserNotFoundException(user_id=user_id)
            return user

        return await self.repo.update_user(user_id, {"email": email})

    async def admin_update_user(
        self,
        user_id: UUID,
        *,
        email: str | None = None,
        is_active: bool | None = None,
        is_admin: bool | None = None,
    ) -> User:
        """
        Admin-only user update. Enforces business rules (e.g., last admin protection).
        Authorization must be handled by the caller.
        """
        updates: dict[str, object] = {}
        if email is not None:
            updates["email"] = email
        if is_active is not None:
            updates["is_active"] = is_active
        if is_admin is not None:
            updates["is_admin"] = is_admin

        if not updates:
            user = await self.repo.get_user_by_id(user_id)
            if not user:
                raise UserNotFoundException(user_id=user_id)
            return user

        # Business rule: prevent deactivating the last active admin
        if is_admin is False or is_active is False:
            target_user = await self.repo.get_user_by_id(user_id)
            if not target_user:
                raise UserNotFoundException(user_id=user_id)

            # Only enforce if we're disabling an admin account
            if target_user.is_admin and (
                (is_admin is False) or (is_active is False and target_user.is_active)
            ):
                admin_count = await self.repo.count_active_admins()
                if admin_count <= 1:
                    raise ValueError("Cannot deactivate the last admin account")

        return await self.repo.update_user(user_id, updates)

    # ──────────────────────────────────────────────────────────────
    # Authentication
    # ──────────────────────────────────────────────────────────────

    async def authenticate(self, email: str, password: str) -> User:
        """
        Authenticate user credentials.

        Fails closed:
        - Invalid email
        - Invalid password
        - Inactive account
        """
        user = await self.repo.get_user_by_email(email)

        if not user:
            raise AuthenticationFailedException(identifier=email)

        if not user.is_active:
            raise AuthenticationFailedException(identifier=email)

        if not security.verify_password(password, user.password_hash):
            raise AuthenticationFailedException(identifier=email)

        return user

    # ──────────────────────────────────────────────────────────────
    # Token issuance
    # ──────────────────────────────────────────────────────────────

    async def issue_tokens(self, user: User) -> tuple[str, str]:
        """
        Issue a new access token and refresh token pair.
        """
        access_token = security.create_token(
            subject=str(user.id),
            token_type="access",
            expires_delta=timedelta(minutes=config.JWT_ACCESS_TOKEN_EXPIRE_MINUTES),
        )

        refresh_token_value = security.create_token(
            subject=str(user.id),
            token_type="refresh",
            expires_delta=timedelta(days=config.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )

        refresh_token = RefreshToken(
            user_id=user.id,
            token_hash=refresh_token_value,
            expires_at=datetime.utcnow()
            + timedelta(days=config.JWT_REFRESH_TOKEN_EXPIRE_DAYS),
        )

        await self.repo.save_refresh_token(refresh_token)

        return access_token, refresh_token_value

    async def create_password_reset_token(self, email: str) -> str:
        """
        Generate a short-lived password reset token.
        In production: trigger email send instead of returning token.
        """
        user = await self.repo.get_user_by_email(email)
        if not user:
            # Security: don't reveal if email exists
            # Still return a token-shaped string to avoid timing attacks
            return "invalid-email-placeholder"

        return security.create_token(
            subject=str(user.id),
            token_type="reset",
            expires_delta=timedelta(minutes=15),
        )

    # ──────────────────────────────────────────────────────────────
    # Token refresh
    # ──────────────────────────────────────────────────────────────

    async def refresh_tokens(self, refresh_token_value: str) -> tuple[str, str]:
        """
        Rotate refresh token and issue new token pair.

        Rules:
        - Token must exist in DB
        - Token must be valid JWT
        - Token must be of type 'refresh'
        """
        stored = await self.repo.get_refresh_token_by_hash(refresh_token_value)
        if not stored:
            raise InvalidTokenException()

        payload = security.decode_token(refresh_token_value)
        if payload.get("type") != "refresh":
            raise InvalidTokenException()

        user = await self.repo.get_user_by_id(UUID(payload["sub"]))
        if not user or not user.is_active:
            raise InvalidTokenException()

        # Rotate token
        await self.repo.delete_refresh_token(stored)
        return await self.issue_tokens(user)

    async def list_refresh_tokens(self, user_id: UUID) -> list[RefreshToken]:
        """
        List all refresh tokens for a user.
        """
        return await self.repo.list_refresh_tokens_for_user(user_id)

    # ──────────────────────────────────────────────────────────────
    # Password management
    # ──────────────────────────────────────────────────────────────

    async def change_password(
        self,
        user_id: UUID,
        current_password: str,
        new_password: str,
    ) -> None:
        """
        Change a user's password.

        Rules:
        - Current password must match
        - All refresh tokens are revoked
        """
        user = await self.repo.get_user_by_id(user_id)
        if not user:
            raise AuthenticationFailedException(identifier=str(user_id))

        if not security.verify_password(current_password, user.password_hash):
            raise AuthenticationFailedException(identifier=user.email)

        await self.repo.update_user(
            user_id,
            {"password_hash": security.hash_password(new_password)},
        )

        # Defensive security: invalidate all sessions
        await self.repo.delete_all_refresh_tokens_for_user(user_id)

    async def reset_password(self, token: str, new_password: str) -> None:
        """
        Reset password using a reset token.
        """
        payload = security.decode_token(token)
        if payload.get("type") != "reset":
            raise InvalidTokenException()

        user_id = UUID(payload["sub"])
        user = await self.repo.get_user_by_id(user_id)
        if not user:
            raise InvalidTokenException()

        await self.repo.update_user(
            user_id,
            {"password_hash": security.hash_password(new_password)},
        )

        await self.repo.delete_all_refresh_tokens_for_user(user_id)

    # ──────────────────────────────────────────────────────────────
    # Logout
    # ──────────────────────────────────────────────────────────────

    async def logout(self, refresh_token_value: str) -> None:
        """
        Logout from a single session.
        """
        token = await self.repo.get_refresh_token_by_hash(refresh_token_value)
        if token:
            await self.repo.delete_refresh_token(token)

    async def logout_all(self, user_id: UUID) -> None:
        """
        Logout from all sessions.
        """
        await self.repo.delete_all_refresh_tokens_for_user(user_id)

    # ──────────────────────────────────────────────────────────────
    # Delete users
    # ──────────────────────────────────────────────────────────────
    async def delete_user(self, user_id: UUID) -> None:
        """
        Permanently delete a user and revoke all tokens.

        WARNING:
        This is a destructive operation.
        """
        await self.repo.delete_user_and_tokens(user_id)
