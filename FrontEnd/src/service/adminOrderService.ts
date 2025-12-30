import { httpClient } from "./httpClient";
import type { OrderResponse } from "./orderService";

export const adminOrderService = {
  getAllOrders: async (page: number = 0, size: number = 10) => {
    return httpClient<{
      content: OrderResponse[];
      totalPages: number;
      totalElements: number;
    }>(`/orders/admin?page=${page}&size=${size}`);
  },
  cancelOrder: async (orderId: number) => {
    return httpClient<void>(`/orders/${orderId}/cancel`, { method: "PUT" });
  },
};
