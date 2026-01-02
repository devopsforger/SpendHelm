"""
Authentication schemas with explicit validation.
"""

import re

from pydantic import BaseModel, EmailStr, field_validator

from src.app.core.config import config
from src.app.core.exceptions import InvalidPasswordException


class RegisterRequest(BaseModel):
    """Registration request schema with password validation."""

    email: EmailStr
    password: str

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        """
        Enforce password policy from environment.
        """
        if len(value) < config.MIN_PASSWORD_LENGTH:
            raise InvalidPasswordException(
                requirement=f"Minimum length {config.MIN_PASSWORD_LENGTH}"
            )

        if config.REQUIRE_UPPERCASE and not re.search(r"[A-Z]", value):
            raise InvalidPasswordException("At least one uppercase letter")

        if config.REQUIRE_LOWERCASE and not re.search(r"[a-z]", value):
            raise InvalidPasswordException("At least one lowercase letter")

        if config.REQUIRE_NUMBER and not re.search(r"\d", value):
            raise InvalidPasswordException("At least one number")

        if config.REQUIRE_SPECIAL_CHAR and not re.search(r"[^\w\s]", value):
            raise InvalidPasswordException("At least one special character")

        return value


class LoginRequest(BaseModel):
    """Login request schema."""

    email: EmailStr
    password: str


class ChangePasswordRequest(BaseModel):
    """Change password request schema."""

    current_password: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        """Validate the new password."""
        return RegisterRequest.validate_password(value)


class ForgotPasswordRequest(BaseModel):
    """Forgot password request schema."""

    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request schema."""

    token: str
    new_password: str

    @field_validator("new_password")
    @classmethod
    def validate_new_password(cls, value: str) -> str:
        """Validate the new password."""
        return RegisterRequest.validate_password(value)


class TokenResponse(BaseModel):
    """Token response schema."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"


# src/app/auth/schemas.py


class UpdateUserRequest(BaseModel):
    """Regular users can only update non-sensitive fields."""

    email: EmailStr | None = None

    model_config = {"extra": "forbid"}  # reject unknown fields


class AdminUpdateUserRequest(BaseModel):
    """Admins can update any field."""

    email: EmailStr | None = None
    is_active: bool | None = None
    is_admin: bool | None = None

    model_config = {"extra": "forbid"}
