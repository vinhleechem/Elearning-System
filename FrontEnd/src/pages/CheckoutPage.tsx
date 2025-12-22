import { Container } from "@mui/material";
import PaymentPanel, { type PaymentMethod } from "../components/payment/PaymentPanel";
import OrderSummaryPanel from "../components/order/OrderSummaryPanel";
import CheckoutItemList from "../components/checkout/CheckoutItemList";
import { useState, useMemo } from "react";
import { httpClient } from "../service/httpClient";
import { useCartStore } from "../store/cartStore";
import { orderService } from "../service/orderService";
import { enqueueSnackbar } from "notistack";

const CheckoutPage = () => {
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("momo");
  // const [bankCode, setBankCode] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { items } = useCartStore();

  const { totalAmount, discountAmount, finalAmount } = useMemo(() => {
    const total = items.reduce((sum, item) => sum + item.price, 0);
    const final = items.reduce((sum, item) => sum + (item.discountPrice ?? item.price), 0);
    return {
      totalAmount: total,
      finalAmount: final,
      discountAmount: total - final
    };
  }, [items]);

  const handleCheckout = async () => {
    if (items.length === 0) {
      enqueueSnackbar("Giỏ hàng đang trống", { variant: "warning" });
      return;
    }

    setLoading(true);
    try {
      // 1. Create Order
      const courseIds = items.map(item => item.courseId);
      const orderRes = await orderService.createOrder({ courseIds });

      if (!orderRes.data) {
        throw new Error(orderRes.message || "Không thể tạo đơn hàng");
      }

      const orderId = orderRes.data.orderId;
      const orderAmount = orderRes.data.finalAmount;

      // 2. Process Payment based on method
      if (paymentMethod === "vnpay") {
        const paymentRes = await httpClient<{ paymentUrl: string }>("/payment/create_payment", {
          method: "POST",
          body: JSON.stringify({
            orderId: orderId,
            amount: orderAmount,
            bankCode: "", // Default to empty to let user select bank on payment gateway
            language: "vn"
          })
        });

        if (paymentRes.success && paymentRes.data && paymentRes.data.paymentUrl) {
          window.location.href = paymentRes.data.paymentUrl;
        } else {
          throw new Error(paymentRes.message || "Lỗi tạo thanh toán VNPay");
        }
      } else {
        enqueueSnackbar(`Phương thức thanh toán ${paymentMethod} đang được phát triển.`, { variant: "info" });
        setLoading(false);
      }

    } catch (error: any) {
      console.error("Checkout failed", error);
      enqueueSnackbar(error.message || "Có lỗi xảy ra khi thanh toán", { variant: "error" });
      setLoading(false);
    }
  };

  return (
    <div>
      <Container maxWidth="lg">
        <div className="flex min-h-screen">
          <div className="flex-[2] p-6">
            <PaymentPanel
              selected={paymentMethod}
              onSelect={setPaymentMethod}
            />
            <CheckoutItemList />
          </div>
          <OrderSummaryPanel
            onCheckout={handleCheckout}
            totalAmount={totalAmount}
            discountAmount={discountAmount}
            finalAmount={finalAmount}
            loading={loading}
          />
        </div>
      </Container>
    </div>
  );
};

export default CheckoutPage;
