from decimal import Decimal

from pydantic import BaseModel

from app.schemas.order import OrderRead


class DashboardSummary(BaseModel):
    total_products: int
    total_customers: int
    total_orders: int
    low_stock_products: int
    inventory_value: Decimal
    recent_orders: list[OrderRead]

