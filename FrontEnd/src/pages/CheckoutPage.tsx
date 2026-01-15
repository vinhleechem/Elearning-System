import { Container, Paper, Box, Typography } from "@mui/material";
import PaymentPanel, {
  type PaymentMethod,
} from "../components/payment/PaymentPanel";
import OrderSummaryPanel from "../components/order/OrderSummaryPanel";
import CheckoutItemList from "../components/checkout/CheckoutItemList";
import { useState, useEffect, useCallback } from "react";
import { httpClient } from "../service/httpClient";
import { useCartStore } from "../store/cartStore";
import { orderService } from "../service/orderService";
import { voucherService } from "../service/voucherService";
import { useAuthStore } from "../store/authStore";
import { useToast } from "../hooks/useToast";
import type {
  DiscountCalculationRequest,
  DiscountCalculationResponse,
} from "../types/voucher";
import VoucherSection from "../components/voucher/VoucherSection";

const CheckoutPage = () => {
  const { items, voucherCode, setVoucherCode } = useCartStore();
  const { user } = useAuthStore();
  const { enqueueSnackbar } = useToast();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  const [loading, setLoading] = useState(false);
  const [appliedVoucherCode, setAppliedVoucherCode] = useState<
    string | undefined
  >(voucherCode || undefined);
  const [discountCalculation, setDiscountCalculation] =
    useState<DiscountCalculationResponse | null>(null);

  const calculateDiscount = useCallback(async () => {
    if (!user || items.length === 0) {
      setDiscountCalculation(null);
      return;
    }

    try {
      const request: DiscountCalculationRequest = {
        userId: user.userId,
        cartItems: items.map((item) => ({
          courseId: item.courseId,
          price: item.price,
        })),
        voucherCode: appliedVoucherCode,
      };

      const result = await voucherService.calculateDiscount(request);
      setDiscountCalculation(result);
    } catch (error) {
      console.error("Failed to calculate discount:", error);
      // Fallback to simple calculation
      const total = items.reduce((sum, item) => sum + item.price, 0);
      const final = items.reduce(
        (sum, item) => sum + (item.discountPrice ?? item.price),
        0,
      );
      setDiscountCalculation({
        subtotal: total,
        totalDiscount: total - final,
        finalAmount: final,
        discounts: [],
        itemPrices: [],
      });
    }
  }, [user, items, appliedVoucherCode]);

  // Calculate discount when cart items or voucher changes
  useEffect(() => {
    calculateDiscount();
  }, [calculateDiscount]);

  const handleVoucherApply = async (code: string) => {
    if (!code.trim()) {
      enqueueSnackbar("Vui lòng nhập mã voucher", { variant: "warning" });
      return;
    }

    try {
      // Validate voucher with current cart items
      const cartItems = items.map((item) => ({
        courseId: item.courseId,
        price: item.price,
      }));

      const validationResult = await voucherService.validateVoucher(
        code.trim(),
        cartItems,
      );

      if (!validationResult.valid) {
        const errorMsg = validationResult.message || "Mã voucher không hợp lệ";
        enqueueSnackbar(errorMsg, { variant: "error" });
        throw new Error(errorMsg); // Throw to prevent dialog from closing
      }

      setAppliedVoucherCode(code.trim());
      setVoucherCode(code.trim());
      enqueueSnackbar(`Đã áp dụng voucher: ${code}`, { variant: "success" });
    } catch (error: any) {
      console.error("Failed to validate voucher:", error);
      // Re-throw to prevent dialog from closing
      throw error;
    }
  };

  const handleVoucherRemove = () => {
    setAppliedVoucherCode(undefined);
    setVoucherCode(null);
    enqueueSnackbar("Đã xóa voucher", { variant: "info" });
  };

  const handleCheckout = async () => {
    if (items.length === 0) {
      enqueueSnackbar("Giỏ hàng đang trống", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order with voucher code
      const courseIds = items.map((item) => item.courseId);
      const orderRes = await orderService.createOrder({
        courseIds,
        voucherCode: appliedVoucherCode,
      });

      if (!orderRes.data) {
        throw new Error(orderRes.message || "Không thể tạo đơn hàng");
      }

      const orderId = orderRes.data.orderId;
      const orderAmount = orderRes.data.finalAmount;

      // 2. Process Payment based on method
      if (paymentMethod === "vnpay") {
        const paymentRes = await httpClient<{ paymentUrl: string }>(
          "/payment/create_payment",
          {
            method: "POST",
            body: JSON.stringify({
              orderId: orderId,
              amount: orderAmount,
              bankCode: "", // Default to empty to let user select bank on payment gateway
              language: "vn",
            }),
          },
        );

        if (
          paymentRes.success &&
          paymentRes.data &&
          paymentRes.data.paymentUrl
        ) {
          window.location.href = paymentRes.data.paymentUrl;
        } else {
          throw new Error(paymentRes.message || "Lỗi tạo thanh toán VNPay");
        }
      } else {
        enqueueSnackbar(
          `Phương thức thanh toán ${paymentMethod} đang được phát triển.`,
          { variant: "info" },
        );
        setLoading(false);
      }
    } catch (error: unknown) {
      console.error("Checkout failed", error);
      const errorMessage =
        error instanceof Error ? error.message : "Có lỗi xảy ra khi thanh toán";
      enqueueSnackbar(errorMessage, { variant: "error" });
      setLoading(false);
    }
  };

  return (
    <div>
      <Container maxWidth="lg">
        <Typography variant="h4" fontWeight={700} sx={{ py: 3 }}>
          Thanh toán
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            gap: 3,
          }}
        >
          {/* Left Column - Payment & Items */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 66%" } }}>
            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <PaymentPanel
                selected={paymentMethod}
                onSelect={setPaymentMethod}
              />
            </Paper>

            <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
              <CheckoutItemList />
            </Paper>

            {/* Voucher Section */}
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                Mã giảm giá
              </Typography>
              <VoucherSection
                appliedVoucherCode={appliedVoucherCode}
                onVoucherApply={handleVoucherApply}
                onVoucherRemove={handleVoucherRemove}
                orderTotal={
                  discountCalculation?.finalAmount ||
                  items.reduce(
                    (sum, item) => sum + (item.discountPrice ?? item.price),
                    0,
                  )
                }
              />
            </Paper>
          </Box>

          {/* Right Column - Order Summary */}
          <Box sx={{ flex: { xs: "1 1 100%", md: "1 1 33%" } }}>
            {/* Order Summary Panel */}
            <OrderSummaryPanel
              onCheckout={handleCheckout}
              totalAmount={discountCalculation?.subtotal || 0}
              discountAmount={discountCalculation?.totalDiscount || 0}
              finalAmount={discountCalculation?.finalAmount || 0}
              loading={loading}
              discounts={discountCalculation?.discounts || []}
            />
          </Box>
        </Box>
      </Container>
    </div>
  );
};

export default CheckoutPage;
