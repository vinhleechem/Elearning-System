import { Container, Box, Typography, Button, Alert, Snackbar } from "@mui/material";
import { useCartStore } from "../store/cartStore";
import { useEffect, useState, useRef } from "react";
import CartItemList from "../components/cart/CartItemList";
import CartSummary from "../components/cart/CartSummary";
import type { CartItemProps } from "../types/cartItem";


interface PriceChange {
  courseId: number;
  courseTitle: string;
  oldPrice: number;
  newPrice: number;
  isIncrease: boolean;
}

const CartPage = () => {
  const { items, fetchCart, removeFromCart } = useCartStore();
  const [priceChanges, setPriceChanges] = useState<PriceChange[]>([]);
  const [showPriceAlert, setShowPriceAlert] = useState(false);
  const previousPricesRef = useRef<Map<number, number>>(new Map());

  // Initial fetch on mount
  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only fetch on mount

  // Store initial prices
  useEffect(() => {
    if (items.length > 0 && previousPricesRef.current.size === 0) {
      const priceMap = new Map<number, number>();
      items.forEach((item) => {
        priceMap.set(item.courseId, item.discountPrice ?? item.price);
      });
      previousPricesRef.current = priceMap;
    }
  }, [items]);

  // Polling: Refresh cart every 3 minutes when tab is active
  useEffect(() => {
    const POLLING_INTERVAL = 180000; // 3 minutes

    const pollCart = async () => {
      // Only poll if tab is visible
      if (document.visibilityState === 'visible') {
        console.log('🔄 Polling cart prices...');

        // Store old prices before fetching
        const oldPrices = new Map<number, number>();
        items.forEach((item) => {
          oldPrices.set(item.courseId, item.discountPrice ?? item.price);
        });

        // Fetch latest cart data
        await fetchCart();

        // Note: Price comparison will happen in the next useEffect
        // when items state updates
      }
    };

    const intervalId = setInterval(pollCart, POLLING_INTERVAL);

    // Cleanup on unmount
    return () => {
      clearInterval(intervalId);
      console.log('⏹️ Stopped cart polling');
    };
  }, [items, fetchCart]);

  // Detect price changes after items update
  useEffect(() => {
    if (items.length === 0 || previousPricesRef.current.size === 0) {
      return;
    }

    const changes: PriceChange[] = [];

    items.forEach((item) => {
      const currentPrice = item.discountPrice ?? item.price;
      const previousPrice = previousPricesRef.current.get(item.courseId);

      if (previousPrice !== undefined && previousPrice !== currentPrice) {
        changes.push({
          courseId: item.courseId,
          courseTitle: item.courseTitle,
          oldPrice: previousPrice,
          newPrice: currentPrice,
          isIncrease: currentPrice > previousPrice,
        });
      }
    });

    if (changes.length > 0) {
      console.log('💰 Price changes detected:', changes);
      setPriceChanges(changes);
      setShowPriceAlert(true);

      // Update previous prices
      const newPriceMap = new Map<number, number>();
      items.forEach((item) => {
        newPriceMap.set(item.courseId, item.discountPrice ?? item.price);
      });
      previousPricesRef.current = newPriceMap;
    }
  }, [items]);

  const total = items.reduce((acc, item) => {
    return acc + (item.discountPrice ?? item.price);
  }, 0);

  const oldTotal = items.reduce((acc, item) => {
    return acc + item.price;
  }, 0);

  const discountPercent =
    oldTotal > 0 ? Math.ceil(((oldTotal - total) / oldTotal) * 100) : 0;

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
      {/* Price Change Alert */}
      <Snackbar
        open={showPriceAlert}
        autoHideDuration={8000}
        onClose={() => setShowPriceAlert(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        sx={{ mt: 8 }}
      >
        <Alert
          onClose={() => setShowPriceAlert(false)}
          severity={priceChanges.some(c => c.isIncrease) ? "warning" : "success"}
          variant="filled"
          sx={{ width: '100%', maxWidth: 600 }}
        >
          <Typography variant="subtitle2" fontWeight={700} gutterBottom>
            💰 Giá đã được cập nhật!
          </Typography>
          {priceChanges.map((change) => (
            <Typography key={change.courseId} variant="body2" sx={{ mt: 0.5 }}>
              <strong>{change.courseTitle}</strong>:{' '}
              {change.oldPrice.toLocaleString('vi-VN')}₫ →{' '}
              <span style={{ color: change.isIncrease ? '#ff6b6b' : '#51cf66' }}>
                {change.newPrice.toLocaleString('vi-VN')}₫
              </span>
              {change.isIncrease ? ' ⬆️' : ' ⬇️'}
            </Typography>
          ))}
        </Alert>
      </Snackbar>

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
            cartItems={items.map(item => ({
              courseId: item.courseId,
              price: item.discountPrice ?? item.price
            }))}
          />
        </Box>
      </Box>
    </Container>
  );
};

export default CartPage;

