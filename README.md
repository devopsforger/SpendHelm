# Expense Tracker (3-Tier Architecture)

This project is a simple expense tracker application built intentionally as a **three-tier system** to demonstrate how real-world software is designed, structured, and operated.

The application allows users to record expenses, organize them into categories, and view summaries over time. While the functionality is deliberately simple, the system is designed with correctness, clarity, and long-term maintainability in mind.

The goal of this project is **not** to build a flashy finance app, but to use a realistic workload to explore:

* Backend API design
* Database modeling and data integrity
* Frontend data consumption
* Clean separation of concerns
* Deployment and operational practices

---

## High-Level Architecture

The system follows a classic **3-tier architecture**:

1. **Frontend (Presentation Tier)**

   * Handles user interaction
   * Displays expenses, summaries, and forms
   * Communicates with the backend via HTTP APIs

2. **Backend (Application Tier)**

   * Exposes a REST API
   * Enforces business rules
   * Handles authentication, validation, and aggregation

3. **Database (Data Tier)**

   * Stores users, expenses, categories, and summaries
   * Ensures transactional consistency and durability

---

## Repository Structure

```
.
├── backend/        # FastAPI backend
├── frontend/       # Frontend application
├── .gitignore
├── .dockerignore
└── README.md
```

Each tier is developed and reasoned about independently, but designed to work together as a cohesive system.

---

## Guiding Principles

* Simplicity over cleverness
* Explicit over implicit behavior
* Correctness before optimization
* Realistic constraints and trade-offs
* Clear boundaries between layers

---

## What This Project Is Not

* A full-featured fintech platform
* A budgeting or investment advisor
* A microservices-heavy system
* A UI/UX showcase

Those choices are intentional.

---

## Next Steps

Each subdirectory contains its own README with deeper explanations:

* [Backend](backend/README.md)
* [Frontend](frontend/README.md)