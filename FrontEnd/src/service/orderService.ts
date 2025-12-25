import { httpClient } from "./httpClient";

export interface OrderItemResponse {
  courseId: number;
  courseTitle: string;
  price: number;
}

export interface OrderResponse {
  orderId: number;
  items: OrderItemResponse[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
}

export interface CreateOrderRequest {
  courseIds: number[];
  couponCode?: string;
  voucherCode?: string;
}

export const orderService = {
  createOrder: async (payload: CreateOrderRequest) => {
    // Note: OrderController returns ApiResponse { code, message, data } not StandardResponse
    // But httpClient can handle it if we are careful with the types or if backend returns 200 OK.
    return httpClient<OrderResponse>("/orders", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
};
