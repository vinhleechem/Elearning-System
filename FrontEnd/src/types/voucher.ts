// Voucher Types
export type VoucherType =
  | "PUBLIC"
  | "PERSONAL"
  | "REFERRAL"
  | "BIRTHDAY"
  | "FIRST_ORDER"
  | "LOYALTY";

export type VoucherApplicability =
  | "ALL"
  | "SPECIFIC_COURSES"
  | "INSTRUCTOR_COURSES";

export type VoucherSource =
  | "ADMIN_GRANTED"
  | "SELF_CLAIMED"
  | "REFERRAL"
  | "BIRTHDAY_GIFT"
  | "LOYALTY_REWARD";

export type VoucherStatus = "AVAILABLE" | "USED" | "EXPIRED";

export type DiscountType = "PERCENTAGE" | "FIXED";

// Constants for easy reference
export const VoucherType = {
  PUBLIC: "PUBLIC",
  PERSONAL: "PERSONAL",
  REFERRAL: "REFERRAL",
  BIRTHDAY: "BIRTHDAY",
  FIRST_ORDER: "FIRST_ORDER",
  LOYALTY: "LOYALTY",
} as const;

export const VoucherApplicability = {
  ALL: "ALL",
  SPECIFIC_COURSES: "SPECIFIC_COURSES",
  INSTRUCTOR_COURSES: "INSTRUCTOR_COURSES",
} as const;

export const VoucherSource = {
  ADMIN_GRANTED: "ADMIN_GRANTED",
  SELF_CLAIMED: "SELF_CLAIMED",
  REFERRAL: "REFERRAL",
  BIRTHDAY_GIFT: "BIRTHDAY_GIFT",
  LOYALTY_REWARD: "LOYALTY_REWARD",
} as const;

export const VoucherStatus = {
  AVAILABLE: "AVAILABLE",
  USED: "USED",
  EXPIRED: "EXPIRED",
} as const;

export const DiscountType = {
  PERCENTAGE: "PERCENTAGE",
  FIXED: "FIXED",
} as const;

// Voucher Interfaces
export interface Voucher {
  voucherId: number;
  code: string;
  name: string;
  description: string;
  voucherType: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  totalUsageLimit?: number;
  perUserLimit: number;
  usedCount: number;
  currentUsageCount?: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTo: VoucherApplicability;
  specificCourseIds?: number[];
  instructorId?: number;
  createdBy?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserVoucher {
  userVoucherId: number;
  voucherId: number;
  code: string;
  name: string;
  description: string;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  source: VoucherSource;
  receivedAt: string;
  isUsed: boolean;
  usedAt?: string;
  orderId?: number;
  expiryDate: string;
  status: VoucherStatus;
}

export interface VoucherRequest {
  code: string;
  name: string;
  description: string;
  voucherType: VoucherType;
  discountType: DiscountType;
  discountValue: number;
  maxDiscountAmount?: number;
  minOrderValue: number;
  totalUsageLimit?: number;
  perUserLimit: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  applicableTo: VoucherApplicability;
  specificCourseIds?: number[];
  instructorId?: number;
}

export interface ClaimVoucherRequest {
  code: string;
}

export interface DiscountCalculationRequest {
  userId: number;
  cartItems: CartItemRequest[];
  voucherCode?: string;
}

export interface CartItemRequest {
  courseId: number;
  price: number;
}

export interface DiscountCalculationResponse {
  subtotal: number;
  totalDiscount: number;
  finalAmount: number;
  discounts: DiscountDetail[];
  itemPrices: ItemPrice[];
}

export interface DiscountDetail {
  type: "PROMOTION" | "VOUCHER";
  name: string;
  description: string;
  amount: number;
}

export interface ItemPrice {
  courseId: number;
  courseName: string;
  originalPrice: number;
  discountPrice: number;
  finalPrice: number;
  savings: number;
}
