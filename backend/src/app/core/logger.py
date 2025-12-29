"""
Centralized Loguru logging configuration.

This module defines a single logger instance that should be imported
and used across the entire application.
"""

import sys
from pathlib import Path
from loguru import logger

from src.app.core.config import config


# ---------------------------------------------------------------------
# Log directory
# ---------------------------------------------------------------------

LOG_DIR = Path("logs")
LOG_DIR.mkdir(exist_ok=True)


# ---------------------------------------------------------------------
# Log formats
# ---------------------------------------------------------------------

# Base format: used for ALL non-request logs
BASE_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "<level>{message}</level>"
)

# Request format: used ONLY when request context exists
REQUEST_FORMAT = (
    "<green>{time:YYYY-MM-DD HH:mm:ss.SSS}</green> | "
    "<level>{level: <8}</level> | "
    "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
    "req_id={extra[request_id]} | "
    "{extra[method]} {extra[path]} | "
    "status={extra[status_code]} | "
    "duration={extra[duration]}s | "
    "<level>{message}</level>"
)


# ---------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------


def configure_logging() -> None:
    """
    Configure Loguru handlers.

    Must be called once during application startup.
    """

    # Remove default Loguru handler
    logger.remove()

    # -----------------------------------------------------------------
    # Base application logs (startup, migrations, background jobs, etc.)
    # -----------------------------------------------------------------
    logger.add(
        sys.stdout,
        level=config.LOG_LEVEL,
        format=BASE_FORMAT,
        enqueue=True,
        backtrace=config.DEBUG_MODE,
        diagnose=config.DEBUG_MODE,
    )

    logger.add(
        LOG_DIR / "app.log",
        level=config.LOG_LEVEL,
        format=BASE_FORMAT,
        rotation="10 MB",
        retention="14 days",
        compression="zip",
        enqueue=True,
        backtrace=config.DEBUG_MODE,
        diagnose=config.DEBUG_MODE,
    )

    # -----------------------------------------------------------------
    # Request / access logs (only when request context is bound)
    # -----------------------------------------------------------------
    logger.add(
        sys.stdout,
        level=config.LOG_LEVEL,
        format=REQUEST_FORMAT,
        enqueue=True,
        filter=lambda record: "request_id" in record["extra"],
    )

    logger.add(
        LOG_DIR / "requests.log",
        level=config.LOG_LEVEL,
        format=REQUEST_FORMAT,
        rotation="10 MB",
        retention="14 days",
        compression="zip",
        enqueue=True,
        filter=lambda record: "request_id" in record["extra"],
    )

    # -----------------------------------------------------------------
    # Security / auth logs (optional, scoped)
    # -----------------------------------------------------------------
    logger.add(
        LOG_DIR / "security.log",
        level="WARNING",
        format=BASE_FORMAT,
        rotation="5 MB",
        retention="30 days",
        enqueue=True,
        filter=lambda record: record["extra"].get("scope") == "auth",
    )


def get_logger():
    """
    Return the configured Loguru logger.

    Always import the logger via this function.
    """
    return logger
