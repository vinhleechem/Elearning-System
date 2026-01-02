import { httpClient } from "./httpClient";

export interface CommissionRate {
  rateId: number;
  instructorId: number;
  instructorName: string;
  ratePercentage: number;
  minPayoutAmount: number;
  isActive: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InstructorPayout {
  payoutId: number;
  instructorId: number;
  instructorName: string;
  amount: number;
  commissionAmount: number;
  netAmount: number;
  periodStart: string;
  periodEnd: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  paymentMethod?: string;
  transactionId?: string;
  paidAt?: string;
  createdAt: string;
  notes?: string;
}

export interface CommissionRateRequest {
  instructorId: number;
  ratePercentage: number;
  minPayoutAmount?: number;
  isActive?: boolean;
  notes?: string;
}

export interface InstructorPayoutRequest {
  instructorId: number;
  amount: number;
  periodStart: string;
  periodEnd: string;
  paymentMethod?: string;
  transactionId?: string;
  notes?: string;
}

export const commissionService = {
  // Commission Rate Management
  createCommissionRate: async (
    request: CommissionRateRequest,
  ): Promise<CommissionRate> => {
    const response = await httpClient<CommissionRate>("/commission/rates", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return response.data!;
  },

  updateCommissionRate: async (
    rateId: number,
    request: CommissionRateRequest,
  ): Promise<CommissionRate> => {
    const response = await httpClient<CommissionRate>(
      `/commission/rates/${rateId}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      },
    );
    return response.data!;
  },

  getCommissionRate: async (rateId: number): Promise<CommissionRate> => {
    const response = await httpClient<CommissionRate>(
      `/commission/rates/${rateId}`,
    );
    return response.data!;
  },

  getActiveCommissionRateByInstructor: async (
    instructorId: number,
  ): Promise<CommissionRate> => {
    const response = await httpClient<CommissionRate>(
      `/commission/rates/instructor/${instructorId}`,
    );
    return response.data!;
  },

  deactivateCommissionRate: async (rateId: number): Promise<void> => {
    await httpClient(`/commission/rates/${rateId}`, {
      method: "DELETE",
    });
  },

  // Instructor Payout Management
  createPayout: async (
    request: InstructorPayoutRequest,
  ): Promise<InstructorPayout> => {
    const response = await httpClient<InstructorPayout>("/commission/payouts", {
      method: "POST",
      body: JSON.stringify(request),
    });
    return response.data!;
  },

  generatePayout: async (
    instructorId: number,
    periodStart: string,
    periodEnd: string,
  ): Promise<InstructorPayout> => {
    const response = await httpClient<InstructorPayout>(
      `/commission/payouts/generate?instructorId=${instructorId}&periodStart=${periodStart}&periodEnd=${periodEnd}`,
      { method: "POST" },
    );
    return response.data!;
  },

  getPayout: async (payoutId: number): Promise<InstructorPayout> => {
    const response = await httpClient<InstructorPayout>(
      `/commission/payouts/${payoutId}`,
    );
    return response.data!;
  },

  getPayoutsByInstructor: async (
    instructorId: number,
  ): Promise<InstructorPayout[]> => {
    const response = await httpClient<InstructorPayout[]>(
      `/commission/payouts/instructor/${instructorId}`,
    );
    return response.data!;
  },

  getPayoutsByStatus: async (status: string): Promise<InstructorPayout[]> => {
    const response = await httpClient<InstructorPayout[]>(
      `/commission/payouts/status/${status}`,
    );
    return response.data!;
  },

  getAllPayouts: async (page: number = 0, size: number = 10) => {
    const response = await httpClient<{
      content: InstructorPayout[];
      totalPages: number;
      totalElements: number;
      number: number;
    }>(`/commission/payouts?page=${page}&size=${size}`);
    return response.data!;
  },

  updatePayoutStatus: async (
    payoutId: number,
    status: string,
    transactionId?: string,
  ): Promise<InstructorPayout> => {
    const url = `/commission/payouts/${payoutId}/status?status=${status}${
      transactionId ? `&transactionId=${transactionId}` : ""
    }`;
    const response = await httpClient<InstructorPayout>(url, {
      method: "PUT",
    });
    return response.data!;
  },

  completePayout: async (
    payoutId: number,
    transactionId: string,
  ): Promise<InstructorPayout> => {
    const response = await httpClient<InstructorPayout>(
      `/commission/payouts/${payoutId}/complete?transactionId=${transactionId}`,
      { method: "PUT" },
    );
    return response.data!;
  },
};
