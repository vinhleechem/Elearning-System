export interface CartSummaryProps {
  total?: number;
  oldTotal?: number;
  discountPercent?: number;
  onApplyCoupon?: (code: string) => void;
  couponError?: string | null;
  successMessage?: string | null;
  voucherDiscountAmount?: number;
}
