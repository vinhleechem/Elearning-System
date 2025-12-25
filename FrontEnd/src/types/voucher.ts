// Voucher Enums (must be defined before interfaces that use them)
export enum VoucherType {
  PUBLIC = "PUBLIC",
  PERSONAL = "PERSONAL",
  REFERRAL = "REFERRAL",
  BIRTHDAY = "BIRTHDAY",
  FIRST_ORDER = "FIRST_ORDER",
  LOYALTY = "LOYALTY",
}

export enum VoucherApplicability {
  ALL = "ALL",
  SPECIFIC_COURSES = "SPECIFIC_COURSES",
  INSTRUCTOR_COURSES = "INSTRUCTOR_COURSES",
}

export enum VoucherSource {
  ADMIN_GRANTED = "ADMIN_GRANTED",
  SELF_CLAIMED = "SELF_CLAIMED",
  REFERRAL = "REFERRAL",
  BIRTHDAY_GIFT = "BIRTHDAY_GIFT",
  LOYALTY_REWARD = "LOYALTY_REWARD",
}

export enum VoucherStatus {
  AVAILABLE = "AVAILABLE",
  USED = "USED",
  EXPIRED = "EXPIRED",
}

export enum DiscountType {
  PERCENTAGE = "PERCENTAGE",
  FIXED = "FIXED",
}

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
