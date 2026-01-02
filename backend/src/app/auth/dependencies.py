"""
FastAPI authentication dependencies.
"""

from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.model import User
from src.app.auth.repository import AuthRepository
from src.app.auth.security import decode_token
from src.app.core.database import get_db
from src.app.core.exceptions import ExpiredTokenException, InvalidTokenException

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    session: AsyncSession = Depends(get_db),
) -> User:
    """
    Retrieve the current authenticated user based on the provided JWT.
    """
    try:
        payload = decode_token(token)
    except (InvalidTokenException, ExpiredTokenException) as e:
        raise HTTPException(status_code=e.status_code, detail=e.message) from e

    if payload.get("type") != "access":
        raise InvalidTokenException()

    repo = AuthRepository(session)
    user = await repo.get_user_by_id(UUID(payload["sub"]))

    if not user:
        raise InvalidTokenException()

    return user


async def require_admin(current_user: User = Depends(get_current_user)) -> User:
    """Ensure the current user is an admin."""

    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    return current_user
