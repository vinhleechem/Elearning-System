import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import { useWishlistStore } from "../store/wishlistStore";
import { useToast } from "./useToast";
import { getErrorMessage } from "../libs/utils";

/**
 * Custom hook for wishlist operations
 */
export function useWishlist() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    items,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    fetchWishlist,
  } = useWishlistStore();
  const { enqueueSnackbar } = useToast();

  const handleToggleWishlist = useCallback(
    async (courseId: number) => {
      if (!user) {
        navigate("/login");
        return;
      }

      try {
        if (isInWishlist(courseId)) {
          await removeFromWishlist(courseId);
          enqueueSnackbar("Đã xóa khỏi danh sách yêu thích", {
            variant: "info",
          });
        } else {
          await addToWishlist(courseId);
          enqueueSnackbar("Đã thêm vào danh sách yêu thích", {
            variant: "success",
          });
        }
      } catch (error) {
        enqueueSnackbar(getErrorMessage(error), { variant: "error" });
      }
    },
    [
      user,
      isInWishlist,
      addToWishlist,
      removeFromWishlist,
      navigate,
      enqueueSnackbar,
    ],
  );

  return {
    items,
    itemCount: items.length,
    isInWishlist,
    toggleWishlist: handleToggleWishlist,
    fetchWishlist,
  };
}

export default useWishlist;
