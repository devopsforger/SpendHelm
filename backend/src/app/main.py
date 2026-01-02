"""
FastAPI application.
"""

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.app.auth.router import router as auth_router
from src.app.categories.router import router as category_router
from src.app.core.config import config
from src.app.core.database import get_engine, init_db
from src.app.core.error_handlers import setup_error_handlers
from src.app.core.logger import configure_logging, get_logger
from src.app.core.middleware import setup_middleware

logger = get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """
    Application lifespan.
    """
    configure_logging()
    logger.info(f"{config.APP_NAME} is starting up")

    await init_db()
    logger.info("Database connection initialised")
    yield

    logger.info(f"{config.APP_NAME} is shutting down")
    await get_engine().dispose()
    logger.info("Database engine disposed gracefully")
    logger.info("Shutdown complete")


app = FastAPI(
    lifespan=lifespan,
    title=config.APP_NAME,
    description=config.APP_DESCRIPTION,
    version=config.APP_VERSION,
    license_info={
        "name": "MIT",
        "url": "https://opensource.org/licenses/MIT",
    },
    docs_url="/docs" if config.DEBUG_MODE else None,
    redoc_url="/redoc" if config.DEBUG_MODE else None,
    openapi_url="/openapi.json" if config.DEBUG_MODE else None,
)

if config.CORS_ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=config.CORS_ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=["X-Total-Count", "X-Request-ID"],
        max_age=600,
    )


setup_middleware(app)
setup_error_handlers(app)


@app.get("/health", tags=["monitoring"])
async def health_check() -> dict:
    """
    Health check endpoint.
    """
    return {
        "status": "healthy",
        "service": config.APP_NAME,
        "version": config.APP_VERSION,
        "environment": config.ENVIRONMENT,
    }


@app.get("/", tags=["root"])
async def root() -> dict:
    """
    Root endpoint.
    """

    return {
        "message": f"Welcome to {config.APP_NAME}",
        "version": config.APP_VERSION,
        "docs": "/docs" if config.DEBUG_MODE else None,
        "redoc": "/redoc" if config.DEBUG_MODE else None,
        "openapi": "/openapi.json" if config.DEBUG_MODE else None,
    }


app.include_router(auth_router, prefix="/auth")
app.include_router(category_router, prefix="/categories")
