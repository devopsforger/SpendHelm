"""
Standardized response and error schemas for the API using Pydantic models."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import TypeVar, List, Optional, Any, Generic

from pydantic import BaseModel, Field

T = TypeVar("T")


class MetaInformation(BaseModel):
    """
    Metadata about the request and response, used for logging and tracing.

    The request_id is crucial for correlating logs across services.
    """

    request_id: str = Field(..., description="Unique ID for tracing the request.")
    timestamp: float = Field(
        default_factory=lambda: datetime.now(timezone.utc).timestamp(),
        description="Timestamp of when the response was generated (UTC).",
    )
    # to satisfy strict static analyzers like Pylance that flag this as a missing argument.
    pagination: dict[str, Any] | None = Field(
        default=None,
        description="Pagination metadata, if applicable (e.g., skip, limit, total_count).",
    )

    @classmethod
    def from_pagination(
        cls, skip: int, limit: int, total_count: int, request_id: str
    ) -> "MetaInformation":
        """Helper to create MetaInformation with pagination details."""
        return cls(
            request_id=request_id,
            pagination={
                "skip": skip,
                "limit": limit,
                "total_count": total_count,
                "has_more": (skip + limit) < total_count,
            },
        )


# --- Base Generic Response Structure ---


# Inherit from BaseModel and Generic[T] directly for Pydantic V2 compatibility
class BaseResponse(BaseModel, Generic[T]):
    """Generic base response structure for all successful API calls (data wrapper)."""

    message: str = Field(..., description="A human-readable success message.")
    data: T = Field(..., description="The main payload of the response.")
    meta: MetaInformation = Field(
        ..., description="Metadata about the request and response."
    )


# Inherit from the generic BaseResponse, no need for Generic[T] mixin here
class BaseListResponse(BaseResponse[List[T]]):
    """Generic response structure for listing resources."""

    pass


class SimpleResponse(BaseModel):
    """Simple response structure for actions like logout or password change where no data payload is needed."""

    message: str = Field(..., description="A human-readable success message.")
    meta: MetaInformation = Field(
        ..., description="Metadata about the request and response."
    )


class ErrorDetail(BaseModel):
    """
    Detailed information about a single error instance.
    """

    code: str = Field(
        ...,
        description="A short, unique code identifying the type of error (e.g., 'validation_error', 'user_not_found').",
    )
    message: str = Field(
        ..., description="A concise, human-readable message explaining the error."
    )
    field: Optional[str] = Field(
        default=None,
        description="The specific input field that caused the error, if applicable.",
    )
    details: Optional[dict] = Field(
        None, description="Additional context or technical details about the error."
    )


class CustomErrorResponse(BaseModel, Generic[T]):
    """
    The definitive standardized error response wrapper. This structure is intended
    to be used by your global exception handler.
    """

    status: str = Field(
        "error", description="A constant string indicating failure ('error')."
    )
    message: str = Field(
        ...,
        description="A human-readable summary of the error (e.g., 'Request validation failed').",
    )
    data: T = Field(
        ...,
        description="The error payload, typically an ErrorDetail object or a list of them.",
    )
    meta: MetaInformation = Field(
        ...,
        description="Metadata about the request, primarily containing the request_id for tracing.",
    )


class ErrorResponse(CustomErrorResponse[ErrorDetail]):
    """Concrete Error response wrapper for a single error detail (e.g., 404 Not Found)."""

    pass


class ListErrorResponse(CustomErrorResponse[List[ErrorDetail]]):
    """Concrete Error response wrapper for multiple error details (e.g., 422 Validation Errors)."""

    pass
