from fastapi.testclient import TestClient


def create_product(client: TestClient, sku: str = "SKU-001", quantity: int = 10):
    response = client.post(
        "/api/v1/products",
        json={"name": "Widget", "sku": sku, "price": "12.50", "quantity_in_stock": quantity},
    )
    assert response.status_code == 201
    return response.json()


def create_customer(client: TestClient, email: str = "buyer@example.com"):
    response = client.post(
        "/api/v1/customers",
        json={"full_name": "Buyer One", "email": email, "phone": "555-1000"},
    )
    assert response.status_code == 201
    return response.json()


def test_product_crud_and_unique_sku(client: TestClient):
    product = create_product(client)
    assert product["sku"] == "SKU-001"

    duplicate = client.post(
        "/api/v1/products",
        json={"name": "Duplicate", "sku": "SKU-001", "price": "10.00", "quantity_in_stock": 2},
    )
    assert duplicate.status_code == 409

    updated = client.put(f"/api/v1/products/{product['id']}", json={"quantity_in_stock": 15})
    assert updated.status_code == 200
    assert updated.json()["quantity_in_stock"] == 15

    deleted = client.delete(f"/api/v1/products/{product['id']}")
    assert deleted.status_code == 204


def test_customer_crud_and_unique_email(client: TestClient):
    customer = create_customer(client)
    assert customer["email"] == "buyer@example.com"

    duplicate = client.post(
        "/api/v1/customers",
        json={"full_name": "Buyer Two", "email": "buyer@example.com", "phone": None},
    )
    assert duplicate.status_code == 409

    updated = client.put(f"/api/v1/customers/{customer['id']}", json={"phone": "555-2000"})
    assert updated.status_code == 200
    assert updated.json()["phone"] == "555-2000"

    deleted = client.delete(f"/api/v1/customers/{customer['id']}")
    assert deleted.status_code == 204


def test_order_creation_deducts_stock_and_calculates_total(client: TestClient):
    product = create_product(client, quantity=10)
    customer = create_customer(client)

    order_response = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )

    assert order_response.status_code == 201
    order = order_response.json()
    assert order["total_amount"] == "37.50"
    assert order["items"][0]["line_total"] == "37.50"

    product_response = client.get(f"/api/v1/products/{product['id']}")
    assert product_response.json()["quantity_in_stock"] == 7


def test_order_creation_rejects_insufficient_inventory(client: TestClient):
    product = create_product(client, quantity=1)
    customer = create_customer(client)

    order_response = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 3}]},
    )

    assert order_response.status_code == 400
    assert "Insufficient inventory" in order_response.json()["detail"]


def test_negative_quantity_validation(client: TestClient):
    response = client.post(
        "/api/v1/products",
        json={"name": "Bad Stock", "sku": "BAD-001", "price": "1.00", "quantity_in_stock": -1},
    )
    assert response.status_code == 422


def test_delete_order_restores_stock(client: TestClient):
    product = create_product(client, quantity=5)
    customer = create_customer(client)
    order = client.post(
        "/api/v1/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    ).json()

    deleted = client.delete(f"/api/v1/orders/{order['id']}")
    assert deleted.status_code == 204
    product_response = client.get(f"/api/v1/products/{product['id']}")
    assert product_response.json()["quantity_in_stock"] == 5

