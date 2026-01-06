import { httpClient } from "./httpClient";

export interface OrderItemResponse {
  courseId: number;
  courseTitle: string;
  price: number;
  discountPrice?: number;
  finalPrice?: number;
}

export interface DiscountApplied {
  type: 'PROMOTION' | 'VOUCHER';
  name: string;
  description: string;
  amount: number;
  code?: string;
  discountType?: 'PERCENTAGE' | 'FIXED';
  discountValue?: number;
  applicableTo?: string;
  minOrderValue?: number;
  usageCount?: number;
}

export interface OrderResponse {
  orderId: number;
  userId: number;
  userName: string;
  items: OrderItemResponse[];
  totalAmount: number;
  discountAmount: number;
  finalAmount: number;
  status: string;
  createdAt: string;
  discountsApplied?: DiscountApplied[];
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
