# --- Stage 1: Builder Stage ---
# Pinned: Python 3.12 on Debian Bookworm
FROM python:3.12.9-bookworm AS builder

# Install uv system dependencies (if any) and create a non-root user
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    addgroup --system --gid 1001 fastapi && \
    adduser --system --uid 1001 fastapi

WORKDIR /app

# Install uv - pinned to a specific version for reproducibility
ENV UV_VERSION=0.5.8
RUN pip install --no-cache-dir "uv==$UV_VERSION"

# Copy dependency files first to leverage Docker cache [citation:1][citation:9]
COPY ./pyproject.toml ./uv.lock ./

# Install dependencies into a virtual environment
RUN uv venv && \
    . .venv/bin/activate && \
    uv pip install --system -r pyproject.toml

# --- Stage 2: Production Runner ---
# Pinned: Python 3.12 on Debian Bookworm
FROM python:3.12.9-bookworm AS runner

# Create the same non-root user as in the builder stage for consistency
RUN addgroup --system --gid 1001 fastapi && \
    adduser --system --uid 1001 fastapi

WORKDIR /app

# Copy only the virtual environment from the builder stage
COPY --from=builder /app/.venv /app/.venv
COPY --from=builder /etc/passwd /etc/passwd
COPY --from=builder /etc/group /etc/group

# Copy application code (COPY . . would be here in a single-stage build)
COPY ./app /app/app

# Ensure proper ownership of the copied files
RUN chown -R fastapi:fastapi /app

# Switch to non-root user for security [citation:4]
USER fastapi

# Health check to ensure application is running
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8000/health || exit 1

EXPOSE 8000

# Activate virtual environment and run the application
CMD ["/app/.venv/bin/uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]