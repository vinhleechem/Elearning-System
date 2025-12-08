import { create } from "zustand";
import { wishlistService } from "../service/wishlistService";
import type { WishlistResponse } from "../types/wishlist";

interface WishlistState {
    items: WishlistResponse[];
    loading: boolean;
    error: string | null;
    fetchWishlist: () => Promise<void>;
    addToWishlist: (courseId: number) => Promise<void>;
    removeFromWishlist: (courseId: number) => Promise<void>;
    isInWishlist: (courseId: number) => boolean;
    clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>((set, get) => ({
    items: [],
    loading: false,
    error: null,

    fetchWishlist: async () => {
        set({ loading: true, error: null });
        try {
            const items = await wishlistService.getMyWishlist();
            set({ items, loading: false });
        } catch (error: any) {
            set({ error: error.message, loading: false });
        }
    },

    addToWishlist: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
            const newItem = await wishlistService.addToWishlist(courseId);
            set((state) => ({
                items: [...state.items, newItem],
                loading: false,
            }));
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    removeFromWishlist: async (courseId: number) => {
        set({ loading: true, error: null });
        try {
            // Find the wishlistId based on courseId
            const itemToRemove = get().items.find((item) => item.courseId === courseId);
            if (itemToRemove) {
                await wishlistService.removeFromWishlist(itemToRemove.wishlistId);
                set((state) => ({
                    items: state.items.filter((item) => item.courseId !== courseId),
                    loading: false,
                }));
            } else {
                // If not found in local state, maybe try to fetch or just ignore
                set({ loading: false });
            }
        } catch (error: any) {
            set({ error: error.message, loading: false });
            throw error;
        }
    },

    isInWishlist: (courseId: number) => {
        return get().items.some((item) => item.courseId === courseId);
    },

    clearWishlist: () => {
        set({ items: [] });
    },
}));
