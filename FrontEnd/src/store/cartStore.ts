import { create } from "zustand";
import { cartService, type CartItemResponse } from "../service/cartService";

interface CartState {
    items: CartItemResponse[];
    loading: boolean;
    error: string | null;
    fetchCart: () => Promise<void>;
    addToCart: (courseId: number) => Promise<void>;
    removeFromCart: (courseId: number) => Promise<void>;
    clearCart: () => Promise<void>;
    isInCart: (courseId: number) => boolean;
}

export const useCartStore = create<CartState>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchCart: async () => {
        set({ loading: true, error: null });
        try {
            const res = await cartService.getMyCart();
            set({ items: res.data?.items || [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addToCart: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
            const res = await cartService.addToCart(courseId);
            set({ items: res.data?.items || [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error; // Re-throw to handle in UI if needed
        }
    },

    removeFromCart: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
            await cartService.removeFromCart(courseId);
            // Optimistic update or re-fetch
            set((state) => ({
                items: state.items.filter((item) => item.courseId !== courseId),
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    clearCart: async () => {
        set({ loading: true, error: null });
        try {
            await cartService.clearCart();
            set({ items: [], loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    isInCart: (courseId: number) => {
        return get().items.some((item) => item.courseId === courseId);
    },
}));
