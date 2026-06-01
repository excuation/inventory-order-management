# Inventory & Order Management System

A complete full-stack Inventory & Order Management System built using React, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Docker, and Docker Compose.

## Live Deployment

### Frontend

https://inventory-order-management-gules.vercel.app

### Backend API

https://inventory-order-management-1-eeym.onrender.com

### API Documentation

https://inventory-order-management-1-eeym.onrender.com/docs

---

## Features

### Product Management

* Create Product
* View Products
* Update Product
* Delete Product
* Unique SKU validation
* Stock quantity validation

### Customer Management

* Create Customer
* View Customers
* Update Customer
* Delete Customer
* Unique Email validation

### Order Management

* Create Order
* View Orders
* View Order Details
* Delete Order
* Automatic Order Total Calculation

### Inventory Management

* Automatic stock deduction when an order is created
* Automatic stock restoration when an order is deleted
* Inventory validation before order creation
* Low stock monitoring

### Dashboard

* Total Products
* Total Customers
* Total Orders
* Inventory Value
* Recent Orders
* Low Stock Products

### Additional Features

* Responsive UI
* Form Validation
* Success/Error Notifications
* Environment-based Configuration
* Alembic Database Migrations
* Dockerized Deployment
* API Documentation with Swagger UI

---

## Business Rules Implemented

* Product SKU must be unique
* Customer Email must be unique
* Product quantity cannot be negative
* Orders cannot be created if stock is insufficient
* Stock is automatically reduced after order creation
* Stock is automatically restored after order deletion
* Order totals are calculated automatically by the backend
* Request validation implemented
* Proper HTTP status codes implemented
* Error handling implemented throughout the application

---

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Axios

### Backend

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic

### Database

* PostgreSQL

### DevOps

* Docker
* Docker Compose

### Deployment

* Render
* Vercel

### Version Control

* Git
* GitHub

---

## Project Structure

```text
backend/
├── alembic/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── models/
│   ├── schemas/
│   └── services/
├── tests/
├── requirements.txt
└── Dockerfile

frontend/
├── src/
├── public/
├── package.json
├── Dockerfile
└── vite.config.ts

database/
docs/

docker-compose.yml
.env.example
README.md
```

---

## Local Development With Docker

### Create Environment File

```bash
cp .env.example .env
```

### Build and Start Containers

```bash
docker compose up --build
```

### Service URLs

Frontend:

```text
http://localhost:3000
```

Backend API:

```text
http://localhost:8000
```

Swagger Documentation:

```text
http://localhost:8000/docs
```

Health Check:

```text
http://localhost:8000/health
```

PostgreSQL:

```text
localhost:5432
```

The backend container automatically runs:

```bash
alembic upgrade head
```

before starting the API server.

---

## Backend Commands

```bash
cd backend

pip install -r requirements.txt

python -m pytest

python -m ruff check app tests

alembic upgrade head

uvicorn app.main:app --reload
```

---

## Frontend Commands

```bash
cd frontend

npm install

npm run build

npm run lint

npm run dev
```

---

## API Endpoints

### Products

```http
GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{product_id}
PUT    /api/v1/products/{product_id}
DELETE /api/v1/products/{product_id}
```

### Customers

```http
GET    /api/v1/customers
POST   /api/v1/customers
GET    /api/v1/customers/{customer_id}
PUT    /api/v1/customers/{customer_id}
DELETE /api/v1/customers/{customer_id}
```

### Orders

```http
GET    /api/v1/orders
POST   /api/v1/orders
GET    /api/v1/orders/{order_id}
DELETE /api/v1/orders/{order_id}
```

### Dashboard

```http
GET /api/v1/dashboard
```

---

## Docker Setup

### Backend Dockerfile

Included

### Frontend Dockerfile

Included

### Docker Compose

Included

### Environment Variables

Included

### PostgreSQL Persistence

Implemented using Docker Volumes

---

## Testing

### Backend Tests

```bash
python -m pytest
```

### Linting

```bash
python -m ruff check app tests
```

### Frontend Build Verification

```bash
npm run build
```

### Docker Compose Validation

```bash
docker compose config
```

---

## Deployment Checklist

* Configure secure production environment variables
* Configure PostgreSQL database credentials
* Configure BACKEND_CORS_ORIGINS
* Configure frontend API URL
* Run database migrations
* Enable HTTPS
* Configure backups
* Configure logging

---

## Submission Deliverables

### GitHub Repository

https://github.com/excuation/inventory-order-management

### Live Frontend

https://inventory-order-management-gules.vercel.app

### Live Backend

https://inventory-order-management-1-eeym.onrender.com

### API Documentation

https://inventory-order-management-1-eeym.onrender.com/docs

---

## Verification Completed

### Backend

```bash
python -m pytest
```

Passed

```bash
python -m ruff check app tests
```

Passed

### Frontend

```bash
npm run build
```

Passed

```bash
npm run lint
```

Passed

### Docker

```bash
docker compose config
```

Passed
