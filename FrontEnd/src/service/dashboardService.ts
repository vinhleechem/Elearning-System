import { httpClient } from "./httpClient";
import type { OrderResponse } from "./orderService";

export type DashboardStats = {
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  totalCourses: number;
  userGrowth: number;
  orderGrowth: number;
  revenueGrowth: number;
  courseGrowth: number;
};

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await httpClient<DashboardStats>("/admin/dashboard/stats");
    if (!response.data) {
      throw new Error("No data received from server");
    }
    return response.data;
  },

  getRecentOrders: async (limit: number = 5): Promise<OrderResponse[]> => {
    const response = await httpClient<{ content: OrderResponse[] }>(
      `/orders/admin?page=0&size=${limit}&sort=createdAt,desc`,
    );
    if (!response.data?.content) {
      return [];
    }
    return response.data.content;
  },
};
