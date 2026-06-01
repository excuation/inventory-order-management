from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.schemas.customer import CustomerRead
from app.schemas.product import ProductRead


class OrderItemCreate(BaseModel):
    product_id: int = Field(..., gt=0)
    quantity: int = Field(..., gt=0)


class OrderCreate(BaseModel):
    customer_id: int = Field(..., gt=0)
    items: list[OrderItemCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def ensure_unique_products(self) -> "OrderCreate":
        product_ids = [item.product_id for item in self.items]
        if len(product_ids) != len(set(product_ids)):
            raise ValueError("Duplicate products are not allowed in one order")
        return self


class OrderItemRead(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: Decimal
    line_total: Decimal
    product: ProductRead

    model_config = ConfigDict(from_attributes=True)


class OrderRead(BaseModel):
    id: int
    customer_id: int
    total_amount: Decimal
    customer: CustomerRead
    items: list[OrderItemRead]

    model_config = ConfigDict(from_attributes=True)

