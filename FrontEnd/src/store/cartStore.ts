import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { cartService, type CartItemResponse } from "../service/cartService";
import { getErrorMessage } from "../libs/utils";

interface CartState {
  items: CartItemResponse[];
  loading: boolean;
  error: string | null;
  //hàm này ko nhận tham số đầu vào, trả về 1 Promise ko trả về giá trị nào(void) => chỉ thay đổi state bên trong store
  fetchCart: () => Promise<void>;
  //hàm này nhận tham số đầu vào là courseId, trả về 1 Promise => thay đổi state bên trong store
  addToCart: (courseId: number) => Promise<void>;
  removeFromCart: (courseId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isInCart: (courseId: number) => boolean;
  voucherCode: string | null;
  setVoucherCode: (code: string | null) => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      loading: false,
      error: null,
      voucherCode: null,

      setVoucherCode: (code) => set({ voucherCode: code }),

      fetchCart: async () => {
        set({ loading: true, error: null });
        try {
          const res = await cartService.getMyCart();
          set({ items: res.data?.items || [], loading: false });
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
        }
      },

      addToCart: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
          const res = await cartService.addToCart(courseId);
          set({ items: res.data?.items || [], loading: false });
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
          throw error;
        }
      },

      removeFromCart: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
          await cartService.removeFromCart(courseId);
          set((state) => ({
            items: state.items.filter((item) => item.courseId !== courseId),
            loading: false,
          }));
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
        }
      },

      clearCart: async () => {
        set({ loading: true, error: null });
        try {
          await cartService.clearCart();
          set({ items: [], loading: false });
        } catch (error) {
          set({ error: getErrorMessage(error), loading: false });
        }
      },

      isInCart: (courseId: number) => {
        return get().items.some((item) => item.courseId === courseId);
      },
    }),
    {
      name: "cart-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    },
  ),
);
