import { httpClient } from "./httpClient";

export interface RevenueStats {
  totalRevenue: number;
  monthRevenue: number;
  todayRevenue: number;
  totalOrders: number;
  monthOrders: number;
  todayOrders: number;
  growthRate: number;
  averageOrderValue: number;
}

export interface DailyRevenue {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface CategoryRevenue {
  categoryId: number;
  categoryName: string;
  revenue: number;
  orderCount: number;
  percentage: number;
}

export interface CourseRevenue {
  courseId: number;
  courseTitle: string;
  categoryName: string;
  revenue: number;
  salesCount: number;
  averagePrice: number;
}

export interface InstructorRevenue {
  instructorId: number;
  instructorName: string;
  revenue: number;
  orderCount: number;
  courseSales: number;
  commissionAmount: number;
  instructorEarnings: number;
}

export interface PaymentMethodRevenue {
  paymentMethod: string;
  revenue: number;
  transactionCount: number;
  percentage: number;
}

export interface MonthlyRevenue {
  year: number;
  month?: number;
  quarter?: number;
  revenue: number;
  orderCount: number;
  period: string;
}

export interface DiscountImpact {
  totalBeforeDiscount: number;
  totalDiscount: number;
  totalAfterDiscount: number;
  orderCount: number;
  ordersWithDiscount: number;
  discountPercentage: number;
  orderDiscountRate: number;
}

export const revenueService = {
  getStats: async (): Promise<RevenueStats> => {
    const response = await httpClient<RevenueStats>("/revenue/stats");
    return response.data!;
  },

  getDailyRevenue: async (
    startDate: string,
    endDate: string,
  ): Promise<DailyRevenue[]> => {
    const response = await httpClient<DailyRevenue[]>(
      `/revenue/daily?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getRevenueByCategory: async (
    startDate: string,
    endDate: string,
  ): Promise<CategoryRevenue[]> => {
    const response = await httpClient<CategoryRevenue[]>(
      `/revenue/by-category?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getTopCourses: async (
    limit: number,
    startDate: string,
    endDate: string,
  ): Promise<CourseRevenue[]> => {
    const response = await httpClient<CourseRevenue[]>(
      `/revenue/top-courses?limit=${limit}&startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getRevenueByInstructor: async (
    startDate: string,
    endDate: string,
  ): Promise<InstructorRevenue[]> => {
    const response = await httpClient<InstructorRevenue[]>(
      `/revenue/by-instructor?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getRevenueByPaymentMethod: async (
    startDate: string,
    endDate: string,
  ): Promise<PaymentMethodRevenue[]> => {
    const response = await httpClient<PaymentMethodRevenue[]>(
      `/revenue/by-payment-method?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getMonthlyRevenue: async (
    startDate: string,
    endDate: string,
  ): Promise<MonthlyRevenue[]> => {
    const response = await httpClient<MonthlyRevenue[]>(
      `/revenue/monthly?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getQuarterlyRevenue: async (
    startDate: string,
    endDate: string,
  ): Promise<MonthlyRevenue[]> => {
    const response = await httpClient<MonthlyRevenue[]>(
      `/revenue/quarterly?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },

  getDiscountImpact: async (
    startDate: string,
    endDate: string,
  ): Promise<DiscountImpact> => {
    const response = await httpClient<DiscountImpact>(
      `/revenue/discount-impact?startDate=${startDate}&endDate=${endDate}`,
    );
    return response.data!;
  },
};
