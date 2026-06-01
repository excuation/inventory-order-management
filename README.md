# Inventory & Order Management System

A complete full-stack Inventory & Order Management System built with React, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Docker, and Docker Compose.

## Features

- Product CRUD with unique SKU validation
- Customer CRUD with unique email validation
- Order creation, listing, detail retrieval, and deletion
- Automatic stock deduction when orders are created
- Stock restoration when orders are deleted
- Automatic order total calculation
- Insufficient inventory errors with proper HTTP status codes
- Dashboard metrics and recent orders
- Responsive React UI with success and error messages
- Environment-based configuration
- Alembic database migrations
- Backend API tests and frontend production build

## Project Structure

```text
backend/
  alembic/
  app/
    api/
    core/
    db/
    models/
    schemas/
    services/
  tests/
frontend/
  src/
database/
docs/
docker-compose.yml
.env.example
```

## Local Development With Docker

Create your environment file:

```bash
cp .env.example .env
```

Start the application:

```bash
docker compose up --build
```

Service URLs:

- Frontend: <http://localhost:3000>
- Backend API: <http://localhost:8000>
- API docs: <http://localhost:8000/docs>
- Health check: <http://localhost:8000/health>
- PostgreSQL: `localhost:5432`

The backend container runs `alembic upgrade head` before starting the API.

## Backend Commands

```bash
cd backend
python -m pip install -r requirements.txt
python -m pytest
python -m ruff check app tests
alembic upgrade head
uvicorn app.main:app --reload
```

## Frontend Commands

```bash
cd frontend
npm install
npm run build
npm run lint
npm run dev
```

## API Summary

- `GET /api/v1/products`
- `POST /api/v1/products`
- `GET /api/v1/products/{product_id}`
- `PUT /api/v1/products/{product_id}`
- `DELETE /api/v1/products/{product_id}`
- `GET /api/v1/customers`
- `POST /api/v1/customers`
- `GET /api/v1/customers/{customer_id}`
- `PUT /api/v1/customers/{customer_id}`
- `DELETE /api/v1/customers/{customer_id}`
- `GET /api/v1/orders`
- `POST /api/v1/orders`
- `GET /api/v1/orders/{order_id}`
- `DELETE /api/v1/orders/{order_id}`
- `GET /api/v1/dashboard`

## Deployment Checklist

1. Set secure production values in `.env`, especially `SECRET_KEY` and database credentials.
2. Restrict `BACKEND_CORS_ORIGINS` to the deployed frontend origin.
3. Use a managed PostgreSQL instance or a persistent Docker volume.
4. Run `alembic upgrade head` during release.
5. Build the frontend with `npm run build` and serve the static assets behind a production web server or platform.
6. Put the FastAPI service behind HTTPS and a reverse proxy or cloud load balancer.
7. Enable database backups and application log collection.

## Verified Locally

- Backend tests: `python -m pytest`
- Backend lint: `python -m ruff check app tests`
- Frontend build: `npm run build`
- Frontend lint: `npm run lint`
- Docker Compose config: `docker compose config`

