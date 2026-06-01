from decimal import Decimal

from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.models.customer import Customer
from app.models.order import Order, OrderItem
from app.models.product import Product
from app.schemas.order import OrderCreate
from app.services.exceptions import InsufficientInventoryError, NotFoundError


def _order_options():
    return (
        selectinload(Order.customer),
        selectinload(Order.items).selectinload(OrderItem.product),
    )


def list_orders(db: Session) -> list[Order]:
    statement = select(Order).options(*_order_options()).order_by(Order.id.desc())
    return list(db.scalars(statement).all())


def get_order(db: Session, order_id: int) -> Order:
    statement = select(Order).where(Order.id == order_id).options(*_order_options())
    order = db.scalar(statement)
    if order is None:
        raise NotFoundError("Order not found")
    return order


def create_order(db: Session, payload: OrderCreate) -> Order:
    customer = db.get(Customer, payload.customer_id)
    if customer is None:
        raise NotFoundError("Customer not found")

    product_ids = [item.product_id for item in payload.items]
    products = {
        product.id: product
        for product in db.scalars(select(Product).where(Product.id.in_(product_ids)).with_for_update()).all()
    }

    missing_products = [product_id for product_id in product_ids if product_id not in products]
    if missing_products:
        raise NotFoundError(f"Product not found: {missing_products[0]}")

    order_items: list[OrderItem] = []
    total = Decimal("0.00")

    for item in payload.items:
        product = products[item.product_id]
        if product.quantity_in_stock < item.quantity:
            raise InsufficientInventoryError(
                f"Insufficient inventory for SKU {product.sku}. Available: {product.quantity_in_stock}"
            )
        product.quantity_in_stock -= item.quantity
        unit_price = product.price
        line_total = unit_price * item.quantity
        total += line_total
        order_items.append(
            OrderItem(
                product_id=product.id,
                quantity=item.quantity,
                unit_price=unit_price,
                line_total=line_total,
            )
        )

    order = Order(customer_id=customer.id, total_amount=total, items=order_items)
    db.add(order)
    db.commit()
    return get_order(db, order.id)


def delete_order(db: Session, order_id: int) -> None:
    order = get_order(db, order_id)
    for item in order.items:
        product = db.get(Product, item.product_id)
        if product is not None:
            product.quantity_in_stock += item.quantity
    db.delete(order)
    db.commit()

