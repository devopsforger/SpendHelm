"""
Cryptographic primitives for authentication.

Responsibilities:
- Password hashing & verification
- JWT creation & decoding
- Reset password token generation

No database access.
No FastAPI imports.
"""

import datetime as dt_mod
from datetime import datetime, timedelta
from typing import Any

from jose import jwt
from jose.exceptions import ExpiredSignatureError, JWTError
from passlib.context import CryptContext

from src.app.core.config import config
from src.app.core.exceptions import ExpiredTokenException, InvalidTokenException

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a plaintext password using Argon2."""
    return pwd_context.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    """Verify a plaintext password against its hash."""
    return pwd_context.verify(password, password_hash)


def create_token(
    subject: str,
    token_type: str,
    expires_delta: timedelta,
    extra_payload: dict[str, Any] | None = None,
) -> str:
    """
    Create a signed JWT.

    Args:
        subject: User identifier
        token_type: 'access', 'refresh', or 'reset'
        expires_delta: Token lifetime
        extra_payload: Optional additional claims

    Returns:
        Encoded JWT string
    """
    payload = {
        "sub": subject,
        "type": token_type,
        "exp": datetime.now(dt_mod.UTC) + expires_delta,
        **(extra_payload or {}),
    }
    return jwt.encode(
        payload,
        config.JWT_SECRET_KEY,
        algorithm=config.JWT_ALGORITHM,
    )


def decode_token(token: str) -> dict[str, Any]:
    """
    Decode and validate a JWT.

    Raises:
        InvalidTokenException
        ExpiredTokenException
    """
    try:
        return jwt.decode(
            token,
            config.JWT_SECRET_KEY,
            algorithms=[config.JWT_ALGORITHM],
        )
    except ExpiredSignatureError as exc:
        raise ExpiredTokenException() from exc
    except JWTError as exc:
        raise InvalidTokenException() from exc
