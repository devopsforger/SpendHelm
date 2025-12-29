# Frontend Overview

The frontend is a user-facing application that allows users to record expenses, browse their spending history, and view summaries over time.

It is designed to:

* Be simple to use
* Be predictable in behavior
* Reflect backend data accurately
* Avoid unnecessary complexity

---

## Responsibilities

The frontend handles:

* User authentication flows
* Expense entry and editing
* Displaying expense history
* Displaying reports and summaries
* Managing categories
* Managing user preferences

All business rules live in the backend.

---

## Application Structure

The frontend consists of:

* Public pages (login, signup, landing)
* Authenticated pages (dashboard, expenses, reports)
* A shared authenticated layout with navigation

---

## Navigation Model

Authenticated users interact with the app through a persistent side navigation that provides access to:

* Dashboard
* Expenses
* Categories
* Reports
* Settings

This keeps navigation predictable and reduces cognitive load.

---

## Data Handling

* Data is fetched from the backend via HTTP APIs
* Pagination is used for all list views
* Empty states are handled explicitly
* Errors are displayed clearly without exposing internals

---

## Design Philosophy

* Information-first, not visual-first
* Clear forms with minimal fields
* Honest summaries, not judgments
* Explicit loading and error states

---

## What the Frontend Does Not Do

* No business rule enforcement
* No data aggregation
* No financial advice
* No offline-first logic (initially)

---

## Summary

The frontend exists to **make backend data understandable**, not to hide or reinterpret it.
Its simplicity is a feature, not a limitation.
