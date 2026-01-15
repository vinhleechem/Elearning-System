import { httpClient } from "./httpClient";
import type { OrderResponse, OrderItemResponse } from "./orderService";

export interface OrderDetailResponse extends OrderResponse {
  orderCode?: string;
  user?: {
    userId: number;
    fullName: string;
    email: string;
    phone?: string;
    avatar?: string;
  };
  subtotal?: number;
  totalDiscount?: number;
  items: Array<OrderItemResponse & {
    orderItemId?: number;
    courseThumbnail?: string;
    instructorName?: string;
    instructorAvatar?: string;
    originalPrice?: number;
    savings?: number;
    rating?: number;
    students?: number;
  }>;
  payment?: {
    paymentId: number;
    method: string;
    status: string;
    amount: number;
    paidAt: string;
    transactionId?: string;
  };
}

export const adminOrderService = {
  getAllOrders: async (page: number = 0, size: number = 10) => {
    return httpClient<{
      content: OrderResponse[];
      totalPages: number;
      totalElements: number;
    }>(`/orders/admin?page=${page}&size=${size}`);
  },
  getOrderById: async (orderId: number) => {
    return httpClient<OrderDetailResponse>(`/orders/admin/${orderId}`);
  },
  cancelOrder: async (orderId: number) => {
    return httpClient<void>(`/orders/${orderId}/cancel`, { method: "PUT" });
  },
};
