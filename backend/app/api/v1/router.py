from fastapi import APIRouter

from app.api.v1.routes import customers, dashboard, orders, products

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(products.router)
api_router.include_router(customers.router)
api_router.include_router(orders.router)
api_router.include_router(dashboard.router)

