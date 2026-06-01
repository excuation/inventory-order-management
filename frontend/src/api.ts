import axios from "axios";
import type {
  Customer,
  CustomerPayload,
  DashboardSummary,
  Order,
  OrderPayload,
  Product,
  ProductPayload
} from "./types";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8000/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

export function getApiError(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const detail = error.response?.data?.detail;
    if (typeof detail === "string") {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail.map((item) => item.msg).join(", ");
    }
    return error.message;
  }
  return "Something went wrong";
}

export const inventoryApi = {
  dashboard: async () => (await api.get<DashboardSummary>("/dashboard")).data,

  listProducts: async () => (await api.get<Product[]>("/products")).data,
  createProduct: async (payload: ProductPayload) => (await api.post<Product>("/products", payload)).data,
  updateProduct: async (id: number, payload: Partial<ProductPayload>) =>
    (await api.put<Product>(`/products/${id}`, payload)).data,
  deleteProduct: async (id: number) => api.delete(`/products/${id}`),

  listCustomers: async () => (await api.get<Customer[]>("/customers")).data,
  createCustomer: async (payload: CustomerPayload) => (await api.post<Customer>("/customers", payload)).data,
  updateCustomer: async (id: number, payload: Partial<CustomerPayload>) =>
    (await api.put<Customer>(`/customers/${id}`, payload)).data,
  deleteCustomer: async (id: number) => api.delete(`/customers/${id}`),

  listOrders: async () => (await api.get<Order[]>("/orders")).data,
  createOrder: async (payload: OrderPayload) => (await api.post<Order>("/orders", payload)).data,
  deleteOrder: async (id: number) => api.delete(`/orders/${id}`)
};

