import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useCartStore } from "../store/cartStore";
import { useToast } from "./useToast";
import { getErrorMessage } from "../libs/utils";

/**
 * Custom hook for cart operations
 * Consolidates cart logic used across multiple components
 */
export function useCart() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { items, addToCart, removeFromCart, isInCart, fetchCart } =
    useCartStore();
  const { enqueueSnackbar } = useToast();

  const handleAddToCart = useCallback(
    async (courseId: number) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        await addToCart(courseId);
        enqueueSnackbar("Đã thêm vào giỏ hàng", { variant: "success" });
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error), { variant: "error" });
      }
    },
    [user, addToCart, navigate, enqueueSnackbar],
  );

  const handleRemoveFromCart = useCallback(
    async (courseId: number) => {
      try {
        await removeFromCart(courseId);
        enqueueSnackbar("Đã xóa khỏi giỏ hàng", { variant: "success" });
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error), { variant: "error" });
      }
    },
    [removeFromCart, enqueueSnackbar],
  );

  const goToCart = useCallback(() => {
    navigate("/cart");
  }, [navigate]);

  const goToCheckout = useCallback(() => {
    navigate("/payment/checkout");
  }, [navigate]);

  const checkAndAddToCart = useCallback(
    async (courseId: number) => {
      if (!user) {
        navigate("/login");
        return;
      }

      if (isInCart(courseId)) {
        goToCart();
      } else {
        await handleAddToCart(courseId);
      }
    },
    [user, isInCart, handleAddToCart, goToCart, navigate],
  );

  return {
    items,
    itemCount: items.length,
    isInCart,
    addToCart: handleAddToCart,
    removeFromCart: handleRemoveFromCart,
    checkAndAddToCart,
    goToCart,
    goToCheckout,
    fetchCart,
  };
}

export default useCart;
