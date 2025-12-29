"""Middleware for request logging and request ID assignment."""

import time
import uuid
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from src.app.core.logger import get_logger

logger = get_logger()


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware to assign a unique request ID to each incoming request."""

    async def dispatch(self, request: Request, call_next):
        request_id = uuid.uuid4().hex

        request.state.request_id = request_id

        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id

        return response


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware to log incoming requests and their outcomes."""

    async def dispatch(self, request: Request, call_next):
        start_time = time.perf_counter()  # More precise timer
        request_id = getattr(request.state, "request_id", "none")

        # Bind all useful context — this will appear in EVERY log line from this request
        log = logger.bind(
            request_id=request_id,
            path=request.url.path,
            method=request.method,
            client_ip=request.client.host if request.client else "unknown",
            status_code="-",
            duration="-",
        )

        # Much more informative start log
        log.info(
            "Request started",
        )

        try:
            response = await call_next(request)
            duration = round(time.perf_counter() - start_time, 3)

            log.bind(
                status_code=response.status_code,
                duration=duration,
            ).info("Request completed")

            return response

        except Exception as exc:
            duration = round(time.perf_counter() - start_time, 3)

            # Error log with status (if available) and full traceback
            log.bind(
                status_code=getattr(exc, "status_code", 500),
                duration=duration,
            ).exception("Request failed")
            raise


def setup_middleware(app):
    """Setup middleware for the FastAPI application."""
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
