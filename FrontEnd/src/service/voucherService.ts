import { httpClient } from "./httpClient";
import type {
  Voucher,
  UserVoucher,
  VoucherRequest,
  ClaimVoucherRequest,
  DiscountCalculationRequest,
  DiscountCalculationResponse,
} from "../types/voucher";

const VOUCHER_BASE_URL = "/vouchers";

export const voucherService = {
  // ========== ADMIN APIs ==========

  // Admin - Create voucher
  createVoucher: async (request: VoucherRequest): Promise<Voucher> => {
    const response = await httpClient<Voucher>(VOUCHER_BASE_URL, {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!response.data) {
      throw new Error("Failed to create voucher");
    }
    return response.data;
  },

  // Admin - Update voucher
  updateVoucher: async (
    id: number,
    request: VoucherRequest,
  ): Promise<Voucher> => {
    const response = await httpClient<Voucher>(`${VOUCHER_BASE_URL}/${id}`, {
      method: "PUT",
      body: JSON.stringify(request),
    });
    if (!response.data) {
      throw new Error("Failed to update voucher");
    }
    return response.data;
  },

  // Admin - Get all vouchers (paginated)
  getAllVouchers: async (
    page: number = 0,
    size: number = 10,
  ): Promise<{
    content: Voucher[];
    totalPages: number;
    totalElements: number;
    number: number;
  }> => {
    const url = `${VOUCHER_BASE_URL}?page=${page}&size=${size}`;
    const response = await httpClient<{
      content: Voucher[];
      totalPages: number;
      totalElements: number;
      number: number;
    }>(url, {
      method: "GET",
    });
    console.log("getAllVouchers RAW response:", response);
    console.log("response.data:", response.data);
    console.log("response.success:", response.success);
    if (!response.data) {
      throw new Error("Failed to get vouchers");
    }
    return response.data;
  },

  // Admin - Delete voucher
  deleteVoucher: async (id: number): Promise<void> => {
    await httpClient(`${VOUCHER_BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  // Admin - Grant voucher to users
  grantVoucherToUsers: async (id: number, userIds: number[]): Promise<void> => {
    await httpClient(`${VOUCHER_BASE_URL}/${id}/grant`, {
      method: "POST",
      body: JSON.stringify(userIds),
    });
  },

  // ========== PUBLIC & USER APIs ==========

  // Get public vouchers
  getPublicVouchers: async (): Promise<Voucher[]> => {
    const response = await httpClient<Voucher[]>(`${VOUCHER_BASE_URL}/public`, {
      method: "GET",
    });
    if (!response.data) {
      throw new Error("Failed to get public vouchers");
    }
    return response.data;
  },

  // Get voucher by ID
  getVoucherById: async (id: number): Promise<Voucher> => {
    const response = await httpClient<Voucher>(`${VOUCHER_BASE_URL}/${id}`, {
      method: "GET",
    });
    if (!response.data) {
      throw new Error("Failed to get voucher");
    }
    return response.data;
  },

  // Claim voucher by code
  claimVoucher: async (code: string): Promise<UserVoucher> => {
    const request: ClaimVoucherRequest = { code };
    const response = await httpClient<UserVoucher>(
      `${VOUCHER_BASE_URL}/claim`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!response.data) {
      throw new Error("Failed to claim voucher");
    }
    return response.data;
  },

  // Get my vouchers
  getMyVouchers: async (
    onlyAvailable: boolean = false,
  ): Promise<UserVoucher[]> => {
    const url = `${VOUCHER_BASE_URL}/my-vouchers?onlyAvailable=${onlyAvailable}`;
    const response = await httpClient<UserVoucher[]>(url, {
      method: "GET",
    });
    if (!response.data) {
      throw new Error("Failed to get my vouchers");
    }
    return response.data;
  },

  // Validate voucher code
  validateVoucherCode: async (code: string): Promise<boolean> => {
    const request: ClaimVoucherRequest = { code };
    const response = await httpClient<boolean>(`${VOUCHER_BASE_URL}/validate`, {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (response.data === undefined) {
      throw new Error("Failed to validate voucher");
    }
    return response.data;
  },

  // ========== DISCOUNT CALCULATION APIs ==========

  // Calculate discount for cart
  calculateDiscount: async (
    request: DiscountCalculationRequest,
  ): Promise<DiscountCalculationResponse> => {
    const response = await httpClient<DiscountCalculationResponse>(
      `${VOUCHER_BASE_URL}/calculate-discount`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!response.data) {
      throw new Error("Failed to calculate discount");
    }
    return response.data;
  },

  // Get available discounts
  getAvailableDiscounts: async (): Promise<string[]> => {
    const response = await httpClient<string[]>(
      `${VOUCHER_BASE_URL}/available-discounts`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error("Failed to get available discounts");
    }
    return response.data;
  },

  // ========== INSTRUCTOR APIs ==========

  // Instructor - Create instructor voucher
  createInstructorVoucher: async (
    request: VoucherRequest,
  ): Promise<Voucher> => {
    const response = await httpClient<Voucher>(
      `${VOUCHER_BASE_URL}/instructor`,
      {
        method: "POST",
        body: JSON.stringify(request),
      },
    );
    if (!response.data) {
      throw new Error("Failed to create instructor voucher");
    }
    return response.data;
  },
};

export default voucherService;
