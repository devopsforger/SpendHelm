"""
Server entry point

Runs Alembic migrations (optional) and starts Uvicorn with optimal settings.
All configuration comes from Pydantic Settings → single source of truth.
"""

import sys
from multiprocessing import cpu_count
import alembic.config

from src.app.core.logger import get_logger
from src.app.core.config import config

logger = get_logger()


def run_migrations() -> None:
    """
    Run database migrations.
    """

    if not config.RUN_MIGRATIONS:
        logger.info("RUN_MIGRATIONS=False -> Skipping database migrations.")
        return

    logger.info("Running database migrations...")
    try:
        alembic.config.main(argv=["upgrade", "head"])
        logger.info("Migrations applied successfully")
    except SystemExit as e:
        # Alembic uses sys.exit(0) on success — catch it
        if e.code == 0:
            logger.info("Migrations completed (no changes were made).")
        else:
            logger.error(f"Migrations failed with exit code: {e.code}")
            sys.exit(e.code)
    except Exception as exc:
        logger.error(f"Migrations faild with exception: {exc}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    run_migrations()

    workers = 1 if config.DEBUG_MODE else max(2, (cpu_count() or 1) * 2 + 1)

    logger.info(
        f"Starting {config.APP_NAME} API -> {config.APP_HOST}:{
            config.APP_PORT
        } | Workers: {workers} | Debug: {config.DEBUG_MODE}"
    )

    import uvicorn

    uvicorn.run(
        "src.app.main:app",
        host=config.APP_HOST,
        port=config.APP_PORT,
        workers=workers,
        reload=config.DEBUG_MODE,
        reload_dirs=["app"] if config.DEBUG_MODE else None,
        reload_includes=["*.py"] if config.DEBUG_MODE else None,
        log_level=config.LOG_LEVEL.lower(),
        access_log=not config.DEBUG_MODE,
        timeout_keep_alive=30,
        loop="uvloop" if not config.DEBUG_MODE else "auto",
        http="httptools" if not config.DEBUG_MODE else "auto",
    )
