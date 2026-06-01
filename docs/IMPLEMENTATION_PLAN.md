# Implementation Plan

## Goal

Build a production-ready Inventory & Order Management System with a React frontend, FastAPI backend, PostgreSQL database, Dockerized local environment, and deployable architecture.

## Status

Implemented:

- Product CRUD
- Customer CRUD
- Order creation, listing, detail retrieval, and deletion
- Stock deduction and restoration
- Dashboard endpoint and UI
- Alembic initial migration
- Docker and Docker Compose configuration
- Backend tests
- Frontend responsive UI

## Architecture

- **Frontend:** React, TypeScript, Vite, React Router, Axios, React Hook Form, Zod, Lucide icons.
- **Backend:** FastAPI, SQLAlchemy 2, Pydantic v2, Alembic, PostgreSQL via psycopg.
- **Database:** PostgreSQL 16 with relational constraints and transactional stock updates.
- **Runtime:** Docker and Docker Compose for local development.
- **Configuration:** `.env` values consumed by Docker Compose, backend settings, and frontend Vite variables.

## Domain Model

### Products

- `id`
- `name`
- `sku` with unique database constraint
- `description`
- `price`
- `stock_quantity`
- `reorder_level`
- `is_active`
- timestamps

### Customers

- `id`
- `name`
- `email` with unique database constraint
- `phone`
- `billing_address`
- `shipping_address`
- timestamps

### Orders

- `id`
- `order_number` with unique database constraint
- `customer_id`
- `status`
- `total_amount`
- timestamps

### Order Items

- `id`
- `order_id`
- `product_id`
- `quantity`
- `unit_price`
- `line_total`

## Backend Work

1. Add settings, database session management, CORS, exception handling, and API router registration.
2. Add SQLAlchemy models for products, customers, orders, and order items.
3. Add Alembic environment and first migration with unique constraints and indexes.
4. Add Pydantic schemas with validation:
   - positive product price
   - non-negative stock quantity
   - unique SKU enforced by database and handled gracefully by API
   - valid unique customer email
   - order items must have positive quantity
5. Add repository/service layer:
   - product CRUD
   - customer CRUD
   - order CRUD
   - dashboard aggregation
   - transactional stock deduction on order creation
   - stock restoration or adjustment rules for order cancellation/update
6. Add API routes under `/api/v1`:
   - `/products`
   - `/customers`
   - `/orders`
   - `/dashboard`
7. Add tests for validation, uniqueness, CRUD flows, and stock deduction.

## Frontend Work

1. Build responsive app shell with sidebar/top navigation and mobile layout.
2. Add API client with typed request/response helpers and error handling.
3. Add dashboard:
   - total products
   - low-stock count
   - customer count
   - order count
   - recent orders
4. Add Products pages:
   - list/search
   - create/edit form
   - delete/deactivate
   - low-stock indicators
5. Add Customers pages:
   - list/search
   - create/edit form
   - unique email validation feedback
6. Add Orders pages:
   - list/filter by status
   - create order with customer selector and product line items
   - order detail
   - update status
   - clear insufficient-stock messaging
7. Add responsive styling and accessible controls.

## Docker And Deployment

1. Complete backend Dockerfile for production and development commands.
2. Complete frontend Dockerfile with production static build.
3. Add Compose profiles or separate production compose file if needed.
4. Add README instructions for:
   - local setup
   - migrations
   - tests
   - common Docker commands
   - production deployment checklist

## Verification

- Backend tests pass with `pytest`.
- Frontend typecheck and build pass with `npm run build`.
- Docker Compose builds and starts all services.
- API docs load at `/docs`.
- Responsive UI checked in desktop and mobile viewports.
