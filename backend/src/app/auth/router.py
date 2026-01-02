"""
Authentication and user management HTTP endpoints.

Includes public auth + administrative user/token management.
All domain exceptions are raised and handled globally.
"""

from uuid import UUID

from fastapi import APIRouter, Depends, status
from fastapi.exceptions import HTTPException
from fastapi_pagination import paginate
from fastapi_pagination.limit_offset import LimitOffsetPage, LimitOffsetParams
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.dependencies import get_current_user, require_admin
from src.app.auth.model import User
from src.app.auth.repository import AuthRepository
from src.app.auth.schemas import (
    AdminUpdateUserRequest,
    ChangePasswordRequest,
    ForgotPasswordRequest,
    LoginRequest,
    RegisterRequest,
    ResetPasswordRequest,
    TokenResponse,
    UpdateUserRequest,
)
from src.app.auth.service import AuthService
from src.app.core.database import get_db
from src.app.core.exceptions import UserNotFoundException

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])


# -------------------------------------------------------------------
# Public auth lifecycle
# -------------------------------------------------------------------


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
async def register(
    payload: RegisterRequest, session: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Register a new user and immediately issue tokens."""
    service = AuthService(AuthRepository(session))
    user = await service.register_user(email=payload.email, password=payload.password)
    access, new_refresh = await service.issue_tokens(user)
    return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest, session: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Authenticate user and issue access + refresh tokens."""
    service = AuthService(AuthRepository(session))
    user = await service.authenticate(email=payload.email, password=payload.password)
    access, new_refresh = await service.issue_tokens(user)
    return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    refresh_token: str, session: AsyncSession = Depends(get_db)
) -> TokenResponse:
    """Rotate refresh token and issue new token pair."""
    service = AuthService(AuthRepository(session))
    access, new_refresh = await service.refresh_tokens(refresh_token)
    return TokenResponse(access_token=access, refresh_token=new_refresh)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(refresh_token: str, session: AsyncSession = Depends(get_db)) -> None:
    """Invalidate a single refresh token."""
    service = AuthService(AuthRepository(session))
    await service.logout(refresh_token)


# -------------------------------------------------------------------
# Password management
# -------------------------------------------------------------------


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
async def change_password(
    payload: ChangePasswordRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Change password and revoke all other sessions."""
    service = AuthService(AuthRepository(session))
    await service.change_password(
        user_id=current_user.id,
        current_password=payload.current_password,
        new_password=payload.new_password,
    )


@router.post("/forgot-password")
async def forgot_password(
    payload: ForgotPasswordRequest,
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Request password reset (returns token for testing only)."""
    service = AuthService(AuthRepository(session))
    reset_token = await service.create_password_reset_token(payload.email)
    return {
        "message": "Check email for reset link",
        "reset_token": reset_token,
    }  # Remove token in prod


@router.post("/reset-password", status_code=status.HTTP_204_NO_CONTENT)
async def reset_password(
    payload: ResetPasswordRequest,
    session: AsyncSession = Depends(get_db),
) -> None:
    """Complete password reset."""
    service = AuthService(AuthRepository(session))
    await service.reset_password(token=payload.token, new_password=payload.new_password)


# -------------------------------------------------------------------
# Current user
# -------------------------------------------------------------------


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)) -> dict:
    """Return current user profile."""
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "is_active": current_user.is_active,
        "created_at": current_user.created_at.isoformat(),
    }


# -------------------------------------------------------------------
# Admin: User management
# -------------------------------------------------------------------


@router.get("/users", response_model=LimitOffsetPage[dict])
async def list_users(
    params: LimitOffsetParams = Depends(),
    is_active: bool | None = None,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> LimitOffsetPage[dict]:
    """List users with limit-offset pagination."""
    service = AuthService(AuthRepository(session))
    users = await service.list_users(
        offset=params.offset,
        limit=params.limit,
        is_active=is_active,
    )

    user_items = [
        {
            "id": str(u.id),
            "email": u.email,
            "is_active": u.is_active,
            "created_at": u.created_at.isoformat(),
        }
        for u in users
    ]

    return paginate(user_items, params)


@router.get("/users/{user_id}")
async def get_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """Get a specific user."""
    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this user",
        )
    service = AuthService(AuthRepository(session))
    user = await service.repo.get_user_by_id(user_id)
    if not user:
        raise UserNotFoundException(user_id)
    return {
        "id": str(user.id),
        "email": user.email,
        "is_active": user.is_active,
        "created_at": user.created_at.isoformat(),
    }


@router.patch("/me", status_code=status.HTTP_200_OK)
async def update_own_profile(
    payload: UpdateUserRequest,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """
    Update own user profile (non-sensitive fields only).
    """
    service = AuthService(AuthRepository(session))
    updated_user = await service.update_own_profile(
        current_user.id, email=payload.email
    )
    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "is_active": updated_user.is_active,
    }


# Admin update (admin-only)
@router.patch("/users/{user_id}", status_code=status.HTTP_200_OK)
async def admin_update_user(
    user_id: UUID,
    payload: AdminUpdateUserRequest,
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> dict:
    """Admin update any user fields."""

    service = AuthService(AuthRepository(session))
    updated_user = await service.admin_update_user(
        user_id,
        email=payload.email,
        is_active=payload.is_active,
        is_admin=payload.is_admin,
    )
    return {
        "id": str(updated_user.id),
        "email": updated_user.email,
        "is_active": updated_user.is_active,
        "is_admin": updated_user.is_admin,
    }


@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: UUID,
    session: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """Permanently delete user and all refresh tokens."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required"
        )
    service = AuthService(AuthRepository(session))
    await service.delete_user(user_id)


# -------------------------------------------------------------------
# Admin: Token management
# -------------------------------------------------------------------


@router.get("/users/{user_id}/tokens", response_model=LimitOffsetPage[dict])
async def list_user_tokens(
    user_id: UUID,
    params: LimitOffsetParams = Depends(),
    _: User = Depends(require_admin),
    session: AsyncSession = Depends(get_db),
) -> LimitOffsetPage[dict]:
    """List active refresh tokens for a user with limit-offset pagination."""

    service = AuthService(AuthRepository(session))

    user = await service.repo.get_user_by_id(user_id)
    if not user:
        raise UserNotFoundException(user_id)

    tokens = await service.list_refresh_tokens(user_id)

    token_items = [
        {
            "id": str(t.id),
            "expires_at": t.expires_at.isoformat(),
            "created_at": t.created_at.isoformat() if t.created_at else None,
        }
        for t in tokens
    ]

    return paginate(token_items, params)


@router.delete("/users/{user_id}/tokens", status_code=status.HTTP_204_NO_CONTENT)
async def revoke_all_user_tokens(
    user_id: UUID,
    current_user: User = Depends(get_current_user),
    session: AsyncSession = Depends(get_db),
) -> None:
    """Revoke all refresh tokens for a user (force logout everywhere)."""

    if current_user.id != user_id and not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to revoke this user's tokens",
        )
    service = AuthService(AuthRepository(session))
    await service.logout_all(user_id)
