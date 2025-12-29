"""
Custom exception classes for the application with structured error codes and HTTP status codes."""

from typing import Any, Dict, Optional
from fastapi import status


class BaseAppException(Exception):
    """
    Base exception class embedding a text error code and HTTP status code.

    Attributes:
        message (str): Human-readable error message.
        error_code (str): Text-based error identifier (e.g., 'TOKEN_REQUIRED').
        status_code (int): HTTP status code for the error response.
        details (dict): Additional context for the error.
    """

    def __init__(
        self,
        message: str,
        error_code: str,
        status_code: int,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.message = message
        self.error_code = error_code
        self.status_code = status_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationException(BaseAppException):
    """Exception for validation errors (e.g., missing or invalid input)."""

    def __init__(
        self,
        message: str,
        error_code: str,
        validation_errors: Optional[Dict[str, Any]] = None,
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"validation_errors": validation_errors}
            if validation_errors
            else None,
        )


class NotFoundException(BaseAppException):
    """Exception for resources not found (e.g., user or token)."""

    resource: str
    identifier: str
    error_code: str

    def __init__(self, resource: str, identifier: str, error_code: str):
        super().__init__(
            message=f"{resource} not found: {identifier}",
            error_code=error_code,
            status_code=status.HTTP_404_NOT_FOUND,
            details={"resource": resource, "identifier": identifier},
        )
        # Explicitly set attributes to satisfy Pylint
        self.resource = resource
        self.identifier = identifier
        self.error_code = error_code


class DuplicateResourceException(BaseAppException):
    """Exception for duplicate resources (e.g., email already registered)."""

    resource: str
    identifier: str
    error_code: str

    def __init__(self, resource: str, identifier: str, error_code: str):
        super().__init__(
            message=f"{resource} already exists: {identifier}",
            error_code=error_code,
            status_code=status.HTTP_409_CONFLICT,
            details={"resource": resource, "identifier": identifier},
        )
        # Explicitly set attributes to satisfy Pylint
        self.resource = resource
        self.identifier = identifier
        self.error_code = error_code


class DatabaseException(BaseAppException):
    """Exception for database-related errors."""

    def __init__(
        self, message: str, error_code: str, original_error: Optional[str] = None
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"error": original_error} if original_error else None,
        )


class InternalServerException(BaseAppException):
    """Exception for unexpected server errors."""

    def __init__(
        self, message: str, error_code: str, details: Optional[Dict[str, Any]] = None
    ):
        super().__init__(
            message=message,
            error_code=error_code,
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details=details,
        )


# ── User Management Exceptions ────────────────────────────────────────
class UserNotFoundException(NotFoundException):
    """User not found exception"""

    def __init__(self, user_id: Any):
        super().__init__(
            resource="User", identifier=str(user_id), error_code="USER_NOT_FOUND"
        )


class UsernameAlreadyInUseException(DuplicateResourceException):
    """Username already registered exception"""

    def __init__(self, username: str):
        super().__init__(
            resource="Username",
            identifier=username,
            error_code="USERNAME_ALREADY_IN_USE",
        )


class EmailAlreadyInUseException(DuplicateResourceException):
    """Email already registered exception"""

    def __init__(self, email: str):
        super().__init__(
            resource="Email", identifier=email, error_code="EMAIL_ALREADY_IN_USE"
        )


class InvalidEmailFormatException(ValidationException):
    """Invalid email format exception"""

    def __init__(self, email: str):
        super().__init__(
            message="Invalid email format",
            error_code="INVALID_EMAIL_FORMAT",
            validation_errors={"email": "Invalid email format"},
        )


class InvalidPasswordException(ValidationException):
    """Invalid password exception"""

    def __init__(self, requirement: str, actual: Optional[str] = None):
        validation_errors = {"password": requirement}
        if actual:
            validation_errors["actual"] = actual

        super().__init__(
            message="Password does not meet requirements",
            error_code="INVALID_PASSWORD",
            validation_errors=validation_errors,
        )


class UserUpdateFailedException(BaseAppException):
    """User update failed exception"""

    def __init__(self, field: str, reason: str):
        super().__init__(
            message="Failed to update user",
            error_code="USER_UPDATE_FAILED",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"field": field, "reason": reason},
        )


class EmailNotVerifiedException(BaseAppException):
    """Email not verified exception"""

    def __init__(self, email: str):
        super().__init__(
            message="Email address not verified",
            error_code="EMAIL_NOT_VERIFIED",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"email": email},
        )


# ── Authentication & Authorization ────────────────────────────────────
class AuthenticationFailedException(BaseAppException):
    """Authentication failed exception"""

    def __init__(self, identifier: str):
        super().__init__(
            message="Invalid credentials",
            error_code="AUTHENTICATION_FAILED",
            status_code=status.HTTP_401_UNAUTHORIZED,
            details={"identifier": identifier},
        )


class PermissionDeniedException(BaseAppException):
    """Permission denied exception"""

    def __init__(self, action: str, resource: str):
        super().__init__(
            message="You do not have permission to perform this action",
            error_code="PERMISSION_DENIED",
            status_code=status.HTTP_403_FORBIDDEN,
            details={"action": action, "resource": resource},
        )


class ExpiredTokenException(BaseAppException):
    """Expired token exception"""

    def __init__(self):
        super().__init__(
            message="Authentication token has expired",
            error_code="TOKEN_EXPIRED",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class InvalidTokenException(BaseAppException):
    """Invalid token exception"""

    def __init__(self):
        super().__init__(
            message="Invalid authentication token",
            error_code="TOKEN_INVALID",
            status_code=status.HTTP_401_UNAUTHORIZED,
        )


class SecurityException(BaseAppException):
    """Security-related exceptions"""

    def __init__(self, reason: str):
        super().__init__(
            message="A security-related error occurred",
            error_code="SECURITY_ERROR",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"reason": reason},
        )


class RateLimitExceededException(BaseAppException):
    """Rate limit exceeded exception"""

    def __init__(self, limit: int, window: str):
        super().__init__(
            message="Too many requests, please try again later",
            error_code="RATE_LIMIT_EXCEEDED",
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            details={"limit": limit, "window": window},
        )


# ── AI Tools & Content Management ─────────────────────────────────────
class ToolNotFoundException(NotFoundException):
    """AI tool not found exception"""

    def __init__(self, tool_id: Any):
        super().__init__(
            resource="AI Tool", identifier=str(tool_id), error_code="TOOL_NOT_FOUND"
        )


class ToolAlreadyExistsException(DuplicateResourceException):
    """AI tool already exists exception"""

    def __init__(self, name: str):
        super().__init__(
            resource="AI Tool", identifier=name, error_code="TOOL_ALREADY_EXISTS"
        )


class BlogPostNotFoundException(NotFoundException):
    """Blog post not found exception"""

    def __init__(self, post_id: Any):
        super().__init__(
            resource="Blog Post",
            identifier=str(post_id),
            error_code="BLOG_POST_NOT_FOUND",
        )


class JobListingNotFoundException(NotFoundException):
    """Job listing not found exception"""

    def __init__(self, job_id: Any):
        super().__init__(
            resource="Job Listing",
            identifier=str(job_id),
            error_code="JOB_LISTING_NOT_FOUND",
        )


class EventNotFoundException(NotFoundException):
    """Event not found exception"""

    def __init__(self, event_id: Any):
        super().__init__(
            resource="Event", identifier=str(event_id), error_code="EVENT_NOT_FOUND"
        )


# ── System & Database ────────────────────────────────────────────────
class DatabaseErrorException(DatabaseException):
    """Database operation failed exception"""

    def __init__(self, operation: str, detail: str):
        super().__init__(
            message="Database operation failed",
            error_code="DATABASE_ERROR",
            original_error=f"{operation}: {detail}",
        )


class ExternalServiceErrorException(BaseAppException):
    """External service error exception"""

    def __init__(self, service: str, operation: str):
        super().__init__(
            message="External service temporarily unavailable",
            error_code="EXTERNAL_SERVICE_ERROR",
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            details={"service": service, "operation": operation},
        )


class FileUploadErrorException(BaseAppException):
    """File upload error exception"""

    def __init__(self, filename: str, reason: str):
        super().__init__(
            message="File upload failed",
            error_code="FILE_UPLOAD_ERROR",
            status_code=status.HTTP_400_BAD_REQUEST,
            details={"filename": filename, "reason": reason},
        )


# ── Generic Business Logic ───────────────────────────────────────────
class ResourceConflictException(BaseAppException):
    """Resource conflict exception"""

    def __init__(self, resource: str, constraint: str):
        super().__init__(
            message="Resource conflict detected",
            error_code="RESOURCE_CONFLICT",
            status_code=status.HTTP_409_CONFLICT,
            details={"resource": resource, "constraint": constraint},
        )


class ToolSlugAlreadyExistsException(DuplicateResourceException):
    """Tool slug already exists exception"""

    def __init__(self, slug: str):
        super().__init__(
            resource="Tool", identifier=slug, error_code="TOOL_SLUG_ALREADY_EXISTS"
        )


class ToolNameAlreadyExistsException(DuplicateResourceException):
    """Tool name already exists exception"""

    def __init__(self, name: str):
        super().__init__(
            resource="Tool", identifier=name, error_code="TOOL_NAME_ALREADY_EXISTS"
        )


class CreatorNotFoundException(NotFoundException):
    """Creator user not found exception"""

    def __init__(self, user_id: Any):
        super().__init__(
            resource="User", identifier=str(user_id), error_code="CREATOR_NOT_FOUND"
        )


class CategorySlugAlreadyExistsException(DuplicateResourceException):
    """Category slug already exists exception"""

    def __init__(self, slug: str):
        super().__init__(
            resource="Category",
            identifier=slug,
            error_code="CATEGORY_SLUG_ALREADY_EXISTS",
        )


class CategoryNameAlreadyExistsException(DuplicateResourceException):
    """Category name already exists exception"""

    def __init__(self, name: str):
        super().__init__(
            resource="Category",
            identifier=name,
            error_code="CATEGORY_NAME_ALREADY_EXISTS",
        )


class CategoryNotFoundException(NotFoundException):
    """Category not found exception"""

    def __init__(self, category_id: Any):
        super().__init__(
            resource="Category",
            identifier=str(category_id),
            error_code="CATEGORY_NOT_FOUND",
        )


class TagSlugAlreadyExistsException(DuplicateResourceException):
    """Tag slug already exists exception"""

    def __init__(self, slug: str):
        super().__init__(
            resource="Tag", identifier=slug, error_code="TAG_SLUG_ALREADY_EXISTS"
        )


class TagNameAlreadyExistsException(DuplicateResourceException):
    """Tag name already exists exception"""

    def __init__(self, name: str):
        super().__init__(
            resource="Tag", identifier=name, error_code="TAG_NAME_ALREADY_EXISTS"
        )


class TagNotFoundException(NotFoundException):
    """Tag not found exception"""

    def __init__(self, tag_id: Any):
        super().__init__(
            resource="Tag", identifier=str(tag_id), error_code="TAG_NOT_FOUND"
        )
