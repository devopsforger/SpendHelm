"""
error handlers
"""

import uuid
from fastapi import Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import IntegrityError

from src.app.core.logger import get_logger

from src.app.core.exceptions import (
    BaseAppException,
    ValidationException,
    DuplicateResourceException,
    EmailAlreadyInUseException,
    UsernameAlreadyInUseException,
    ResourceConflictException,
)

from src.app.core.schemas import ErrorDetail, ErrorResponse, MetaInformation

logger = get_logger()


async def base_app_exception_handler(request: Request, exc: BaseAppException):
    """Handle all BaseAppException and its subclasses"""
    request_id = getattr(request.state, "request_id", None) or uuid.uuid4().hex[:12]
    error_id = uuid.uuid4().hex[:12]

    error_detail = ErrorDetail(
        code=exc.error_code,
        message=exc.message,
        details=exc.details,
    )

    response_payload = ErrorResponse(
        status="error",
        message=f"Request failed with status: {exc.status_code}",
        data=error_detail,
        meta=MetaInformation(request_id=request_id),
    )

    # Log appropriately based on status code
    log_method = logger.error if exc.status_code >= 500 else logger.warning
    log_method(
        "Business exception",
        error_code=exc.error_code,
        status_code=exc.status_code,
        error_id=error_id,
        path=request.url.path,
        method=request.method,
        user_id=getattr(request.state, "user_id", None),
        client_ip=request.client.host if request.client else None,
        details=exc.details,
        exc_info=exc.status_code >= 500,
    )

    return JSONResponse(
        status_code=exc.status_code,
        content=response_payload.model_dump(by_alias=True, exclude_none=True),
    )


async def validation_handler(request: Request, exc: RequestValidationError):
    """Handle Pydantic validation errors"""
    errors = [
        {
            "field": ".".join(str(loc) for loc in e["loc"] if loc != "body"),
            "message": e["msg"],
            "type": e["type"],
        }
        for e in exc.errors()
    ]

    logger.warning("Input validation failed", errors=errors, path=request.url.path)

    # Convert to your ValidationException
    raise ValidationException(
        message="Request validation failed",
        error_code="VALIDATION_ERROR",
        validation_errors={"fields": errors},
    )


async def integrity_handler(request: Request, exc: IntegrityError):
    """Handle database integrity errors"""
    logger.warning("Database integrity error", exc_info=True, path=request.url.path)

    # Extract meaningful constraint info when possible
    error_str = str(exc.orig).lower() if exc.orig else str(exc).lower()

    if "unique constraint" in error_str:
        if "email" in error_str:
            raise EmailAlreadyInUseException(email="unknown")
        elif "username" in error_str:
            raise UsernameAlreadyInUseException(username="unknown")
        else:
            constraint_info = (
                str(exc).split('"')[-2] if '"' in str(exc) else "unknown_constraint"
            )
            raise DuplicateResourceException(
                resource="database_entry",
                identifier=constraint_info,
                error_code="DUPLICATE_RESOURCE",
            )
    else:
        # Generic resource conflict for other integrity errors
        raise ResourceConflictException(
            resource="database_entry", constraint="integrity_constraint_violation"
        )


async def unexpected_handler(request: Request, exc: Exception):
    """Catch-all for unexpected exceptions"""
    request_id = getattr(request.state, "request_id", None) or uuid.uuid4().hex[:12]
    error_id = uuid.uuid4().hex[:12]

    logger.exception(
        "Unhandled exception",
        error_id=error_id,
        path=request.url.path,
        method=request.method,
        client_ip=request.client.host if request.client else None,
    )

    response_payload = ErrorResponse(
        status="error",
        message="An unexpected error occurred",
        data=ErrorDetail(
            code="INTERNAL_SERVER_ERROR",
            message="An unexpected error occurred",
            details={"error_id": error_id},
        ),
        meta=MetaInformation(request_id=request_id),
    )

    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content=response_payload.model_dump(by_alias=True, exclude_none=True),
    )


def setup_error_handlers(app):
    """Register all exception handlers"""
    # Base handler for all your custom exceptions
    app.add_exception_handler(BaseAppException, base_app_exception_handler)

    # FastAPI and database handlers
    app.add_exception_handler(RequestValidationError, validation_handler)
    app.add_exception_handler(IntegrityError, integrity_handler)

    # Catch-all for any unhandled exceptions
    app.add_exception_handler(Exception, unexpected_handler)
