import { httpClient } from "./httpClient";
import type {
  Promotion,
  PromotionDetail,
  PromotionRequest,
} from "../types/promotion";

const PROMOTION_BASE_URL = "/promotions";

export const promotionService = {
  // Admin - Create promotion
  createPromotion: async (
    request: PromotionRequest,
  ): Promise<PromotionDetail> => {
    const response = await httpClient<PromotionDetail>(PROMOTION_BASE_URL, {
      method: "POST",
      body: JSON.stringify(request),
    });
    if (!response.data) {
      throw new Error("Failed to create promotion");
    }
    return response.data;
  },

  // Admin - Update promotion
  updatePromotion: async (
    id: number,
    request: PromotionRequest,
  ): Promise<PromotionDetail> => {
    const response = await httpClient<PromotionDetail>(
      `${PROMOTION_BASE_URL}/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(request),
      },
    );
    if (!response.data) {
      throw new Error("Failed to update promotion");
    }
    return response.data;
  },

  // Get promotion by ID
  getPromotionById: async (id: number): Promise<PromotionDetail> => {
    const response = await httpClient<PromotionDetail>(
      `${PROMOTION_BASE_URL}/${id}`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error("Failed to get promotion");
    }
    return response.data;
  },

  // Admin - Get all promotions (paginated)
  getAllPromotions: async (
    page: number = 0,
    size: number = 10,
  ): Promise<{
    content: Promotion[];
    totalPages: number;
    totalElements: number;
    number: number;
  }> => {
    const url = `${PROMOTION_BASE_URL}?page=${page}&size=${size}`;
    const response = await httpClient<{
      content: Promotion[];
      totalPages: number;
      totalElements: number;
      number: number;
    }>(url, {
      method: "GET",
    });
    if (!response.data) {
      throw new Error("Failed to get promotions");
    }
    return response.data;
  },

  // Get active promotions
  getActivePromotions: async (): Promise<Promotion[]> => {
    const response = await httpClient<Promotion[]>(
      `${PROMOTION_BASE_URL}/active`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error("Failed to get active promotions");
    }
    return response.data;
  },

  // Admin - Delete promotion
  deletePromotion: async (id: number): Promise<void> => {
    await httpClient(`${PROMOTION_BASE_URL}/${id}`, {
      method: "DELETE",
    });
  },

  // Admin - Activate promotion
  activatePromotion: async (id: number): Promise<void> => {
    await httpClient(`${PROMOTION_BASE_URL}/${id}/activate`, {
      method: "PATCH",
    });
  },

  // Admin - Deactivate promotion
  deactivatePromotion: async (id: number): Promise<void> => {
    await httpClient(`${PROMOTION_BASE_URL}/${id}/deactivate`, {
      method: "PATCH",
    });
  },

  // Admin - Import promotions
  importPromotions: async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await httpClient<void>(`${PROMOTION_BASE_URL}/import`, {
      method: "POST",
      body: formData,
    });
  },

  // Admin - Export promotions to Excel
  exportPromotions: async (): Promise<void> => {
    const response = await fetch(`/api/v1${PROMOTION_BASE_URL}/export`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });

    if (!response.ok) {
      throw new Error("Xuất Excel thất bại");
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `promotions_${new Date().getTime()}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },

  // Admin - Sync course prices with active promotions
  syncCoursePrices: async (): Promise<void> => {
    await httpClient(`${PROMOTION_BASE_URL}/sync-prices`, {
      method: "POST",
    });
  },
};

export default promotionService;
