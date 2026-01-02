"""Category API routes."""

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi_pagination import LimitOffsetPage, LimitOffsetParams, paginate
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.auth.dependencies import get_current_user
from src.app.auth.model import User
from src.app.categories.repository import CategoryRepository
from src.app.categories.schemas import (
    CategoryCreate,
    CategoryRead,
    CategoryUpdate,
)
from src.app.categories.service import CategoryService
from src.app.core.database import get_db

router = APIRouter(prefix="/api/v1/categories", tags=["Categories"])


def get_category_service(session: AsyncSession = Depends(get_db)) -> CategoryService:
    """Dependency to get CategoryService instance."""
    repo = CategoryRepository(session)
    return CategoryService(repo)


@router.post("/", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
async def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    """Create a new category for the current user."""
    return await service.create_category(current_user, data)


@router.get("/{category_id}", response_model=CategoryRead)
async def get_category(
    category_id: UUID,  # FastAPI handles UUID conversion
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    """Get a category by ID. Accessible to owner, admins, or for default categories."""
    return await service.get_category(current_user, category_id)


@router.patch("/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    """Update a category. Restricted based on ownership and admin status."""
    return await service.update_category(current_user, category_id, data)


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    """Delete a category. Users can only delete their own non-default categories."""
    await service.delete_category(current_user, category_id)


# Admin-only: list all categories
@router.get("/", response_model=LimitOffsetPage[CategoryRead])
async def list_all_categories(
    params: LimitOffsetParams = Depends(),
    current_user: User = Depends(get_current_user),
    service: CategoryService = Depends(get_category_service),
):
    """List all categories (admin-only)."""
    if not current_user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    categories = await service.list_all_categories(
        offset=params.offset, limit=params.limit
    )
    return paginate(categories, params)
