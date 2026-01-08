import { Container, Box, Typography, Button } from "@mui/material";
import { useCartStore } from "../store/cartStore";
import { useEffect, useState } from "react";
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";
import type { CartItemProps } from "../types/cartItem";
import { voucherService } from "../service/voucherService";
import type { DiscountCalculationResponse } from "../types/voucher";
import { useAuthStore } from "../store/authStore";

const CartPage = () => {
  const { items, fetchCart, removeFromCart, setVoucherCode } = useCartStore();
  const { user } = useAuthStore();

  const [discountData, setDiscountData] =
    useState<DiscountCalculationResponse | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on mount

  useEffect(() => {
    setDiscountData(null);
    setSuccessMessage(null);
    setCouponError(null);
  }, [items]);

  const handleApplyCoupon = async (code: string) => {
    if (!user) {
      setCouponError("Vui lòng đăng nhập để sử dụng mã giảm giá");
      return;
    }
    setCouponError(null);
    setSuccessMessage(null);
    try {
      const request = {
        userId: user.userId,
        cartItems: items.map((item) => ({
          courseId: item.courseId,
          price: item.price,
        })),
        voucherCode: code,
      };
      const response = await voucherService.calculateDiscount(request);
      setDiscountData(response);
      setSuccessMessage("Áp dụng mã giảm giá thành công!");
      setVoucherCode(code);
    } catch (error: any) {
      setCouponError(error.message || "Mã giảm giá không hợp lệ");
      setDiscountData(null);
      setVoucherCode(null);
    }
  };

  const total = discountData
    ? discountData.finalAmount
    : items.reduce((acc, item) => {
      return acc + (item.discountPrice ?? item.price);
    }, 0);

  const oldTotal = items.reduce((acc, item) => {
    return acc + item.price;
  }, 0);

  const discountPercent =
    oldTotal > 0 ? Math.ceil(((oldTotal - total) / oldTotal) * 100) : 0;

  const voucherDiscountAmount = discountData?.discounts
    .filter((d) => d.type === "VOUCHER")
    .reduce((acc, d) => acc + d.amount, 0);

  const cartItems: CartItemProps[] = items.map((item) => ({
    id: item.courseId,
    title: item.courseTitle,
    author: "Giảng viên", // Placeholder
    reviews: 0, // Placeholder
    rating: 0, // Placeholder
    price: item.discountPrice ?? item.price,
    oldPrice: item.discountPrice ? item.price : null,
    image: item.courseImage,
    duration: 0, // Placeholder
    lesson: 0, // Placeholder
  }));

  if (items.length === 0) {
    return (
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <Box
          sx={{
            bgcolor: "white",
            borderRadius: 2,
            p: 6,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.05)",
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={700} gutterBottom>
              Chưa có sản phẩm nào trong giỏ hàng
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Cùng mua sắm hàng ngàn sản phẩm tại Vidi nhé!
            </Typography>
            <Button
              variant="contained"
              color="error"
              href="/"
              sx={{
                textTransform: "none",
                fontWeight: 700,
                px: 4,
                py: 1.2,
                borderRadius: 2,
                bgcolor: "#d32f2f",
                "&:hover": {
                  bgcolor: "#b71c1c",
                },
              }}
            >
              Mua hàng
            </Button>
          </Box>
          <Box
            component="img"
            src="/images/cart/empty-cart.png"
            alt="Empty Cart"
            sx={{ maxWidth: 400, width: "100%" }}
          />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} gutterBottom sx={{ mb: 4 }}>
        Giỏ hàng
      </Typography>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" } }}>
        <CartItemList items={cartItems} onRemove={removeFromCart} />
        <Box sx={{ flex: 1 }}>
          <CartSummary
            total={total}
            oldTotal={oldTotal}
            discountPercent={discountPercent}
            onApplyCoupon={handleApplyCoupon}
            couponError={couponError}
            successMessage={successMessage}
            voucherDiscountAmount={voucherDiscountAmount}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;
