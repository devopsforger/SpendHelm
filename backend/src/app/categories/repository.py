# src/app/categories/repository.py

from uuid import UUID

from sqlalchemy.exc import IntegrityError, SQLAlchemyError
from sqlmodel import and_, func, select
from sqlmodel.ext.asyncio.session import AsyncSession

from src.app.categories.model import Category
from src.app.core.exceptions import (
    CategoryNameAlreadyExistsException,
    DatabaseException,
)
from src.app.core.logger import get_logger

logger = get_logger()


class CategoryRepository:
    """Repository for managing expense categories in the database."""

    def __init__(self, session: AsyncSession):
        self.session = session

    async def get_by_id(self, category_id: UUID) -> Category | None:
        """Fetch a category by its ID."""
        try:
            statement = select(Category).where(Category.id == category_id)
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to fetch category by ID",
                category_id=str(category_id),
                error=str(e),
            )
            raise DatabaseException(
                "Category lookup failed", "CATEGORY_FETCH_FAILED"
            ) from e

    async def get_user_category_by_name(
        self, user_id: UUID, name: str
    ) -> Category | None:
        """Fetch a user's category by its name."""
        try:
            statement = select(Category).where(
                and_(Category.user_id == user_id, Category.name == name)
            )
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to check category name for user",
                user_id=str(user_id),
                name=name,
                error=str(e),
            )
            raise DatabaseException(
                "Category name check failed", "CATEGORY_NAME_CHECK_FAILED"
            ) from e

    async def get_default_category_by_name(self, name: str) -> Category | None:
        """Fetch a default category by its name."""
        try:
            statement = select(Category).where(
                and_(Category.user_id == None, Category.name == name)
            )
            result = await self.session.exec(statement)
            return result.first()
        except SQLAlchemyError as e:
            logger.error(
                "Failed to check default category name", name=name, error=str(e)
            )
            raise DatabaseException(
                "Default category name check failed",
                "DEFAULT_CATEGORY_NAME_CHECK_FAILED",
            ) from e

    async def create(self, category: Category) -> Category:
        """Create a new category in the database."""
        try:
            self.session.add(category)
            await self.session.commit()
            await self.session.refresh(category)
            logger.info("Category created", category_id=str(category.id))
            return category
        except IntegrityError as e:
            await self.session.rollback()
            orig_msg = str(e.orig).lower() if e.orig else ""
            if "uq_category_user_name" in orig_msg:
                raise CategoryNameAlreadyExistsException(category.name) from e
            raise DatabaseException(
                "Category creation integrity error", "CATEGORY_CREATE_INTEGRITY"
            ) from e
        except SQLAlchemyError as e:
            await self.session.rollback()
            logger.error("Category creation DB error", error=str(e))
            raise DatabaseException(
                "Category creation failed", "CATEGORY_CREATE_FAILED"
            ) from e

    async def update(self, category: Category) -> Category:
        """Update an existing category in the database."""

        try:
            self.session.add(category)
            await self.session.commit()
            await self.session.refresh(category)
            return category
        except IntegrityError as e:
            await self.session.rollback()
            if "uq_category_user_name" in str(e.orig).lower():
                raise CategoryNameAlreadyExistsException(category.name) from e
            raise DatabaseException(
                "Category update integrity error", "CATEGORY_UPDATE_INTEGRITY"
            ) from e
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Category update failed", "CATEGORY_UPDATE_FAILED"
            ) from e

    async def delete(self, category: Category) -> None:
        """Delete a category from the database."""
        try:
            await self.session.delete(category)
            await self.session.commit()
        except SQLAlchemyError as e:
            await self.session.rollback()
            raise DatabaseException(
                "Category deletion failed", "CATEGORY_DELETE_FAILED"
            ) from e

    async def list_all(self, offset: int = 0, limit: int = 100) -> list[Category]:
        """List all categories with pagination."""
        try:
            statement = select(Category).offset(offset).limit(limit)
            result = await self.session.exec(statement)
            return list(result.all())
        except SQLAlchemyError as e:
            raise DatabaseException(
                "Failed to list categories", "CATEGORY_LIST_FAILED"
            ) from e
