"""Service layer for managing expense categories."""

from uuid import UUID

from src.app.auth.model import User
from src.app.categories.model import Category
from src.app.categories.repository import CategoryRepository
from src.app.categories.schemas import CategoryCreate, CategoryUpdate
from src.app.core.exceptions import (
    CategoryNameConflictException,
    CategoryNotFoundException,
    PermissionDeniedException,
)


class CategoryService:
    """Service layer for managing expense categories."""

    def __init__(self, repo: CategoryRepository):
        self.repo = repo

    async def create_category(self, user: User, data: CategoryCreate) -> Category:
        """Create a new category for the given user."""
        
        # Non-admin users cannot create default categories
        if not user.is_admin and data.name.startswith("Default:"):
            raise PermissionDeniedException(
                resource="category", action="create default"
            )

        # Check for name conflict in user's scope
        existing = await self.repo.get_user_category_by_name(user.id, data.name)
        if existing:
            return existing

        # Also prevent conflict with default categories if user tries to mimic one
        if not user.is_admin:
            default_exists = await self.repo.get_default_category_by_name(data.name)
            if default_exists:
                raise CategoryNameConflictException(data.name)

        category = Category(
            user_id=user.id,
            name=data.name.strip(),
            is_default=False,
        )
        return await self.repo.create(category)

    async def get_category(self, requesting_user: User, category_id: UUID) -> Category:
        """Retrieve a category by ID, ensuring the requesting user has access."""

        category = await self.repo.get_by_id(category_id)
        if not category:
            raise CategoryNotFoundException(category_id)

        # Allow access if:
        # - Admin, OR
        # - It's the user's own category, OR
        # - It's a default category (public)
        if (
            requesting_user.is_admin
            or (category.user_id == requesting_user.id)
            or category.is_default
        ):
            return category

        raise PermissionDeniedException(resource="category", action="view")

    async def update_category(
        self, requesting_user: User, category_id: UUID, data: CategoryUpdate
    ) -> Category:
        """Update an existing category."""

        category = await self.get_category(requesting_user, category_id)

        # Only admins can edit default categories or change is_default
        if category.is_default and not requesting_user.is_admin:
            raise PermissionDeniedException(resource="category", action="edit default")

        # Prevent non-admins from making their category default
        if not category.is_default and not requesting_user.is_admin:
            # They can rename, but not turn into default
            pass  # OK to update name

        # Check name uniqueness in appropriate scope
        if category.user_id:  # user-owned
            existing = await self.repo.get_user_category_by_name(
                category.user_id, data.name
            )
            if existing and existing.id != category_id:
                raise CategoryNameConflictException(data.name)
        else:  # default
            existing = await self.repo.get_default_category_by_name(data.name)
            if existing and existing.id != category_id:
                raise CategoryNameConflictException(data.name)

        category.name = data.name.strip()
        return await self.repo.update(category)

    async def delete_category(self, requesting_user: User, category_id: UUID) -> None:
        """Delete a category by ID."""

        category = await self.get_category(requesting_user, category_id)

        if category.is_default and not requesting_user.is_admin:
            raise PermissionDeniedException(
                resource="category", action="delete default"
            )

        if not requesting_user.is_admin and category.user_id != requesting_user.id:
            raise PermissionDeniedException(resource="category", action="delete")

        await self.repo.delete(category)

    async def list_all_categories(
        self, offset: int = 0, limit: int = 100
    ) -> list[Category]:
        """List all categories with pagination."""

        return await self.repo.list_all(offset=offset, limit=limit)
