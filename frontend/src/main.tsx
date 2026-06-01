import React, { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  BarChart3,
  Boxes,
  CheckCircle2,
  PackagePlus,
  ShoppingCart,
  Trash2,
  Users,
  XCircle
} from "lucide-react";
import "./styles/index.css";
import { getApiError, inventoryApi } from "./api";
import type { Customer, CustomerPayload, DashboardSummary, Order, Product, ProductPayload } from "./types";

type Page = "dashboard" | "products" | "customers" | "orders";
type Notice = { type: "success" | "error"; text: string } | null;

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });

function formatMoney(value: string | number) {
  return money.format(Number(value));
}

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [dashboard, setDashboard] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<Notice>(null);

  const showSuccess = (text: string) => setNotice({ type: "success", text });
  const showError = (text: string) => setNotice({ type: "error", text });

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [nextProducts, nextCustomers, nextOrders, nextDashboard] = await Promise.all([
        inventoryApi.listProducts(),
        inventoryApi.listCustomers(),
        inventoryApi.listOrders(),
        inventoryApi.dashboard()
      ]);
      setProducts(nextProducts);
      setCustomers(nextCustomers);
      setOrders(nextOrders);
      setDashboard(nextDashboard);
    } catch (error) {
      showError(getApiError(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const navigation = [
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "products" as const, label: "Products", icon: Boxes },
    { id: "customers" as const, label: "Customers", icon: Users },
    { id: "orders" as const, label: "Orders", icon: ShoppingCart }
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <PackagePlus aria-hidden="true" />
          <span>InventoryOps</span>
        </div>
        <nav className="nav-list" aria-label="Primary">
          {navigation.map((item) => {
            const Icon = item.icon;
            return (
              <button
                className={page === item.id ? "nav-item active" : "nav-item"}
                key={item.id}
                type="button"
                onClick={() => setPage(item.id)}
              >
                <Icon aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </aside>

      <main className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Inventory & Order Management</p>
            <h1>{navigation.find((item) => item.id === page)?.label}</h1>
          </div>
          <button className="secondary-button" type="button" onClick={() => void loadData()}>
            Refresh
          </button>
        </header>

        {notice ? <NoticeBanner notice={notice} onClose={() => setNotice(null)} /> : null}
        {loading ? <div className="loading-panel">Loading application data...</div> : null}

        {!loading && page === "dashboard" && <Dashboard summary={dashboard} products={products} />}
        {!loading && page === "products" && (
          <ProductsPage
            products={products}
            onCreate={async (payload) => {
              await inventoryApi.createProduct(payload);
              showSuccess("Product created");
              await loadData();
            }}
            onUpdate={async (id, payload) => {
              await inventoryApi.updateProduct(id, payload);
              showSuccess("Product updated");
              await loadData();
            }}
            onDelete={async (id) => {
              await inventoryApi.deleteProduct(id);
              showSuccess("Product deleted");
              await loadData();
            }}
            onError={showError}
          />
        )}
        {!loading && page === "customers" && (
          <CustomersPage
            customers={customers}
            onCreate={async (payload) => {
              await inventoryApi.createCustomer(payload);
              showSuccess("Customer created");
              await loadData();
            }}
            onUpdate={async (id, payload) => {
              await inventoryApi.updateCustomer(id, payload);
              showSuccess("Customer updated");
              await loadData();
            }}
            onDelete={async (id) => {
              await inventoryApi.deleteCustomer(id);
              showSuccess("Customer deleted");
              await loadData();
            }}
            onError={showError}
          />
        )}
        {!loading && page === "orders" && (
          <OrdersPage
            customers={customers}
            products={products}
            orders={orders}
            onCreate={async (payload) => {
              await inventoryApi.createOrder(payload);
              showSuccess("Order created and inventory updated");
              await loadData();
            }}
            onDelete={async (id) => {
              await inventoryApi.deleteOrder(id);
              showSuccess("Order deleted and stock restored");
              await loadData();
            }}
            onError={showError}
          />
        )}
      </main>
    </div>
  );
}

function NoticeBanner({ notice, onClose }: { notice: NonNullable<Notice>; onClose: () => void }) {
  const Icon = notice.type === "success" ? CheckCircle2 : XCircle;
  return (
    <div className={`notice ${notice.type}`} role="status">
      <Icon aria-hidden="true" />
      <span>{notice.text}</span>
      <button type="button" onClick={onClose} aria-label="Dismiss message">
        x
      </button>
    </div>
  );
}

function Dashboard({ summary, products }: { summary: DashboardSummary | null; products: Product[] }) {
  const lowStock = products.filter((product) => product.quantity_in_stock <= 5);
  if (!summary) {
    return <div className="empty-state">Dashboard data is unavailable.</div>;
  }
  return (
    <section className="page-stack">
      <div className="metric-grid">
        <Metric label="Products" value={summary.total_products} />
        <Metric label="Customers" value={summary.total_customers} />
        <Metric label="Orders" value={summary.total_orders} />
        <Metric label="Inventory Value" value={formatMoney(summary.inventory_value)} />
      </div>
      <div className="two-column">
        <section className="panel">
          <div className="panel-header">
            <h2>Recent Orders</h2>
          </div>
          <OrderList orders={summary.recent_orders} onDelete={null} />
        </section>
        <section className="panel">
          <div className="panel-header">
            <h2>Low Stock</h2>
            <span className="badge">{summary.low_stock_products}</span>
          </div>
          {lowStock.length === 0 ? (
            <p className="muted">All products are above the low-stock threshold.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStock.map((product) => (
                    <tr key={product.id}>
                      <td>{product.name}</td>
                      <td>{product.sku}</td>
                      <td>
                        <span className="danger-text">{product.quantity_in_stock}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <section className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </section>
  );
}

function ProductsPage({
  products,
  onCreate,
  onUpdate,
  onDelete,
  onError
}: {
  products: Product[];
  onCreate: (payload: ProductPayload) => Promise<void>;
  onUpdate: (id: number, payload: Partial<ProductPayload>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onError: (text: string) => void;
}) {
  const [editing, setEditing] = useState<Product | null>(null);

  return (
    <section className="page-stack">
      <ProductForm
        key={editing?.id ?? "new-product"}
        product={editing}
        onCancel={() => setEditing(null)}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              await onUpdate(editing.id, payload);
              setEditing(null);
            } else {
              await onCreate(payload);
            }
          } catch (error) {
            onError(getApiError(error));
          }
        }}
      />
      <section className="panel">
        <div className="panel-header">
          <h2>Products</h2>
          <span className="badge">{products.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>{formatMoney(product.price)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td className="row-actions">
                    <button type="button" className="text-button" onClick={() => setEditing(product)}>
                      Edit
                    </button>
                    <IconButton label="Delete product" onClick={() => void onDelete(product.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function ProductForm({
  product,
  onSubmit,
  onCancel
}: {
  product: Product | null;
  onSubmit: (payload: ProductPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<ProductPayload>({
    name: product?.name ?? "",
    sku: product?.sku ?? "",
    price: product?.price ?? "0.00",
    quantity_in_stock: product?.quantity_in_stock ?? 0
  });
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.sku.trim() || Number(form.price) < 0 || form.quantity_in_stock < 0) {
      return;
    }
    setBusy(true);
    await onSubmit({ ...form, name: form.name.trim(), sku: form.sku.trim() });
    setBusy(false);
    if (!product) {
      setForm({ name: "", sku: "", price: "0.00", quantity_in_stock: 0 });
    }
  }

  return (
    <form className="panel form-grid" onSubmit={(event) => void submit(event)}>
      <div className="panel-header form-heading">
        <h2>{product ? "Edit Product" : "Add Product"}</h2>
        {product ? (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      <label>
        Name
        <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
      </label>
      <label>
        SKU
        <input required value={form.sku} onChange={(event) => setForm({ ...form, sku: event.target.value })} />
      </label>
      <label>
        Price
        <input
          required
          min="0"
          step="0.01"
          type="number"
          value={form.price}
          onChange={(event) => setForm({ ...form, price: event.target.value })}
        />
      </label>
      <label>
        Quantity
        <input
          required
          min="0"
          type="number"
          value={form.quantity_in_stock}
          onChange={(event) => setForm({ ...form, quantity_in_stock: Number(event.target.value) })}
        />
      </label>
      <button className="primary-button" disabled={busy} type="submit">
        {product ? "Save Product" : "Create Product"}
      </button>
    </form>
  );
}

function CustomersPage({
  customers,
  onCreate,
  onUpdate,
  onDelete,
  onError
}: {
  customers: Customer[];
  onCreate: (payload: CustomerPayload) => Promise<void>;
  onUpdate: (id: number, payload: Partial<CustomerPayload>) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onError: (text: string) => void;
}) {
  const [editing, setEditing] = useState<Customer | null>(null);
  return (
    <section className="page-stack">
      <CustomerForm
        key={editing?.id ?? "new-customer"}
        customer={editing}
        onCancel={() => setEditing(null)}
        onSubmit={async (payload) => {
          try {
            if (editing) {
              await onUpdate(editing.id, payload);
              setEditing(null);
            } else {
              await onCreate(payload);
            }
          } catch (error) {
            onError(getApiError(error));
          }
        }}
      />
      <section className="panel">
        <div className="panel-header">
          <h2>Customers</h2>
          <span className="badge">{customers.length}</span>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone ?? "-"}</td>
                  <td className="row-actions">
                    <button type="button" className="text-button" onClick={() => setEditing(customer)}>
                      Edit
                    </button>
                    <IconButton label="Delete customer" onClick={() => void onDelete(customer.id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function CustomerForm({
  customer,
  onSubmit,
  onCancel
}: {
  customer: Customer | null;
  onSubmit: (payload: CustomerPayload) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<CustomerPayload>({
    full_name: customer?.full_name ?? "",
    email: customer?.email ?? "",
    phone: customer?.phone ?? ""
  });
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.full_name.trim() || !form.email.trim()) {
      return;
    }
    setBusy(true);
    await onSubmit({
      full_name: form.full_name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone?.trim() || null
    });
    setBusy(false);
    if (!customer) {
      setForm({ full_name: "", email: "", phone: "" });
    }
  }

  return (
    <form className="panel form-grid" onSubmit={(event) => void submit(event)}>
      <div className="panel-header form-heading">
        <h2>{customer ? "Edit Customer" : "Add Customer"}</h2>
        {customer ? (
          <button type="button" className="secondary-button" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
      <label>
        Full name
        <input
          required
          value={form.full_name}
          onChange={(event) => setForm({ ...form, full_name: event.target.value })}
        />
      </label>
      <label>
        Email
        <input
          required
          type="email"
          value={form.email}
          onChange={(event) => setForm({ ...form, email: event.target.value })}
        />
      </label>
      <label>
        Phone
        <input value={form.phone ?? ""} onChange={(event) => setForm({ ...form, phone: event.target.value })} />
      </label>
      <button className="primary-button" disabled={busy} type="submit">
        {customer ? "Save Customer" : "Create Customer"}
      </button>
    </form>
  );
}

function OrdersPage({
  customers,
  products,
  orders,
  onCreate,
  onDelete,
  onError
}: {
  customers: Customer[];
  products: Product[];
  orders: Order[];
  onCreate: (payload: { customer_id: number; items: Array<{ product_id: number; quantity: number }> }) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  onError: (text: string) => void;
}) {
  return (
    <section className="page-stack">
      <OrderForm customers={customers} products={products} onCreate={onCreate} onError={onError} />
      <section className="panel">
        <div className="panel-header">
          <h2>Orders</h2>
          <span className="badge">{orders.length}</span>
        </div>
        <OrderList orders={orders} onDelete={onDelete} />
      </section>
    </section>
  );
}

function OrderForm({
  customers,
  products,
  onCreate,
  onError
}: {
  customers: Customer[];
  products: Product[];
  onCreate: (payload: { customer_id: number; items: Array<{ product_id: number; quantity: number }> }) => Promise<void>;
  onError: (text: string) => void;
}) {
  const [customerId, setCustomerId] = useState<number>(customers[0]?.id ?? 0);
  const [productId, setProductId] = useState<number>(products[0]?.id ?? 0);
  const [quantity, setQuantity] = useState(1);
  const [busy, setBusy] = useState(false);

  const selectedProduct = products.find((product) => product.id === productId);
  const estimatedTotal = useMemo(() => {
    if (!selectedProduct) {
      return 0;
    }
    return Number(selectedProduct.price) * quantity;
  }, [quantity, selectedProduct]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!customerId || !productId || quantity <= 0) {
      onError("Choose a customer, product, and positive quantity.");
      return;
    }
    setBusy(true);
    try {
      await onCreate({ customer_id: customerId, items: [{ product_id: productId, quantity }] });
      setQuantity(1);
    } catch (error) {
      onError(getApiError(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="panel form-grid order-form" onSubmit={(event) => void submit(event)}>
      <div className="panel-header form-heading">
        <h2>Create Order</h2>
        <span className="badge">{formatMoney(estimatedTotal)}</span>
      </div>
      <label>
        Customer
        <select value={customerId} onChange={(event) => setCustomerId(Number(event.target.value))} required>
          <option value={0}>Select customer</option>
          {customers.map((customer) => (
            <option key={customer.id} value={customer.id}>
              {customer.full_name}
            </option>
          ))}
        </select>
      </label>
      <label>
        Product
        <select value={productId} onChange={(event) => setProductId(Number(event.target.value))} required>
          <option value={0}>Select product</option>
          {products.map((product) => (
            <option key={product.id} value={product.id}>
              {product.name} ({product.quantity_in_stock} available)
            </option>
          ))}
        </select>
      </label>
      <label>
        Quantity
        <input
          required
          min="1"
          type="number"
          value={quantity}
          onChange={(event) => setQuantity(Number(event.target.value))}
        />
      </label>
      <button className="primary-button" disabled={busy || customers.length === 0 || products.length === 0} type="submit">
        Create Order
      </button>
    </form>
  );
}

function OrderList({ orders, onDelete }: { orders: Order[]; onDelete: ((id: number) => Promise<void>) | null }) {
  if (orders.length === 0) {
    return <p className="muted">No orders yet.</p>;
  }
  return (
    <div className="order-list">
      {orders.map((order) => (
        <article className="order-card" key={order.id}>
          <div>
            <strong>Order #{order.id}</strong>
            <span>{order.customer.full_name}</span>
          </div>
          <div className="order-lines">
            {order.items.map((item) => (
              <span key={item.id}>
                {item.quantity} x {item.product.name} at {formatMoney(item.unit_price)}
              </span>
            ))}
          </div>
          <div className="order-total">
            <strong>{formatMoney(order.total_amount)}</strong>
            {onDelete ? <IconButton label="Delete order" onClick={() => void onDelete(order.id)} /> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

function IconButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button className="icon-button" type="button" aria-label={label} title={label} onClick={onClick}>
      <Trash2 aria-hidden="true" />
    </button>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

