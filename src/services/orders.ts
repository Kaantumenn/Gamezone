import { api } from "@/lib/api";
import { mapMenuFromApi } from "@/lib/mapMenu";
import type {
  ApiCategory,
  ApiOrderItem,
  ApiProduct,
  MenuData,
  OrderItemPayload,
} from "@/types/order";

export async function fetchMenu(): Promise<MenuData> {
  const [categoriesRes, productsRes] = await Promise.all([
    api.get<ApiCategory[]>("/categories"),
    api.get<ApiProduct[]>("/products"),
  ]);

  return mapMenuFromApi(categoriesRes.data, productsRes.data);
}

export async function fetchSessionOrders(
  sessionId: number,
): Promise<ApiOrderItem[]> {
  const { data } = await api.get<ApiOrderItem[]>(`/orders/session/${sessionId}`);
  return data;
}

export async function addOrderItem(payload: OrderItemPayload) {
  const { data } = await api.post("/orders/add-item", {
    sessionId: payload.sessionId,
    productId: payload.productId,
    quantity: payload.quantity ?? 1,
  });
  return data;
}

export async function decreaseOrderItem(payload: OrderItemPayload) {
  const { data } = await api.post("/orders/decrease-item", {
    sessionId: payload.sessionId,
    productId: payload.productId,
  });
  return data;
}

export async function deleteOrderItem(orderItemId: number) {
  const { data } = await api.delete(`/orders/item/${orderItemId}`);
  return data;
}
