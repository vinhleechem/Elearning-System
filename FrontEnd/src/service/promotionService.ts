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
};

export default promotionService;
