export interface Product {
  id: number;
  name: string;
  sku: string;
  price: string;
  quantity_in_stock: number;
}

export interface Customer {
  id: number;
  full_name: string;
  email: string;
  phone: string | null;
}

export interface OrderItem {
  id: number;
  product_id: number;
  quantity: number;
  unit_price: string;
  line_total: string;
  product: Product;
}

export interface Order {
  id: number;
  customer_id: number;
  total_amount: string;
  customer: Customer;
  items: OrderItem[];
}

export interface DashboardSummary {
  total_products: number;
  total_customers: number;
  total_orders: number;
  low_stock_products: number;
  inventory_value: string;
  recent_orders: Order[];
}

export interface ProductPayload {
  name: string;
  sku: string;
  price: string;
  quantity_in_stock: number;
}

export interface CustomerPayload {
  full_name: string;
  email: string;
  phone: string | null;
}

export interface OrderPayload {
  customer_id: number;
  items: Array<{
    product_id: number;
    quantity: number;
  }>;
}

