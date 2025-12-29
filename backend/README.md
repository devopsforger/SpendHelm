# Backend – `backend/README.md`

## Backend Overview

The backend is a **RESTful API** built with **FastAPI**.
It is responsible for authentication, expense management, reporting, and enforcing business rules.

The backend is designed to be:

- Stateless
- Predictable
- Easy to test
- Easy to evolve

---

## Responsibilities

The backend handles:

- User authentication (access + refresh tokens)
- Expense creation and management
- Category management
- Time-based summaries and reports
- Pagination and filtering
- Data validation and integrity
- Health and readiness checks

---

## Architectural Pattern

The backend follows a **Router → Service → Repository** architecture.

### Router (Controller)

- Defines HTTP endpoints
- Parses requests
- Returns HTTP responses
- Delegates all logic

### Service Layer

- Contains business rules
- Coordinates repositories
- Handles transactions
- Enforces authorization and idempotency

### Repository Layer

- Performs database operations
- Contains no business logic
- Returns domain data

This separation keeps the codebase understandable and maintainable as it grows.

---

## API Characteristics

- RESTful, resource-oriented endpoints
- Versioned API (`/api/v1`)
- JSON request and response bodies
- ISO-8601 date formats
- JWT-based authentication
- Offset-based pagination for list endpoints

---

## Authentication Model

- Short-lived **access tokens**
- Long-lived **refresh tokens**
- Refresh token rotation
- Server-side refresh token storage

This mirrors real-world production systems and limits the impact of token leaks.

---

## Pagination

All list endpoints support pagination using:

- `page`
- `page_size`

Responses include:

- Items
- Current page
- Page size
- Total items
- Total pages

---

## Error Handling

The API uses consistent HTTP status codes and error formats:

- `400` – Invalid input
- `401` – Authentication required
- `403` – Forbidden
- `404` – Resource not found
- `409` – Conflict
- `422` – Validation error
- `500` – Internal server error

---

## Data Integrity

- All write operations are transactional
- Foreign key constraints enforced
- Ownership checks on all user-owned data
- Optional soft deletes
- Explicit schema migrations

---

## Operational Endpoints

- `/health` – Basic liveness check
- `/ready` – Readiness check for deployments

These support orchestration, monitoring, and CI/CD pipelines.

---

## Out of Scope (Intentionally)

- Third-party authentication
- Bank integrations
- Background workers
- Notifications
- Webhooks

---

## Summary

The backend is intentionally conservative, explicit, and boring — the kind of system you can reason about under failure, scale, and change.
