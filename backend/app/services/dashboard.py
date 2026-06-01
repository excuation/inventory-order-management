from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.customer import Customer
from app.models.order import Order
from app.models.product import Product
from app.schemas.dashboard import DashboardSummary
from app.services.orders import list_orders


def get_dashboard_summary(db: Session) -> DashboardSummary:
    total_products = db.scalar(select(func.count(Product.id))) or 0
    total_customers = db.scalar(select(func.count(Customer.id))) or 0
    total_orders = db.scalar(select(func.count(Order.id))) or 0
    low_stock_products = db.scalar(select(func.count(Product.id)).where(Product.quantity_in_stock <= 5)) or 0
    inventory_value = db.scalar(select(func.coalesce(func.sum(Product.price * Product.quantity_in_stock), 0))) or Decimal("0")
    recent_orders = list_orders(db)[:5]
    return DashboardSummary(
        total_products=total_products,
        total_customers=total_customers,
        total_orders=total_orders,
        low_stock_products=low_stock_products,
        inventory_value=inventory_value,
        recent_orders=recent_orders,
    )

