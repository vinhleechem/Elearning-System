// Promotion Types
export interface Promotion {
  promotionId: number;
  name: string;
  description: string;
  promotionType: PromotionType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  createdAt: string;
  updatedAt: string;
}

export interface PromotionDetail extends Promotion {
  rules: PromotionRule[];
}

export interface PromotionRule {
  ruleId: number;
  ruleType: PromotionRuleType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  courseIds?: number[];
  categoryIds?: number[];
  buyQuantity?: number;
  getQuantity?: number;
  targetId?: number;
  targetName?: string;
}

export type PromotionType =
  | "FLASH_SALE"
  | "SEASONAL"
  | "SPECIAL_EVENT"
  | "CLEARANCE"
  | "NEW_USER"
  | "LOYALTY";

export type PromotionRuleType =
  | "ALL"
  | "COURSE"
  | "CATEGORY"
  | "CART_TOTAL"
  | "BUY_X_GET_Y";

export type DiscountType = "PERCENTAGE" | "FIXED";

export interface PromotionRequest {
  name: string;
  description: string;
  promotionType: PromotionType;
  startDate: string;
  endDate: string;
  isActive: boolean;
  priority: number;
  rules: PromotionRuleRequest[];
}

export interface PromotionRuleRequest {
  ruleType: PromotionRuleType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minPurchaseAmount?: number;
  courseIds?: number[];
  categoryIds?: number[];
  buyQuantity?: number;
  getQuantity?: number;
}
