import { httpClient } from "./httpClient";
import type { WishlistResponse } from "../types/wishlist";

class WishlistService {
    async getMyWishlist(): Promise<WishlistResponse[]> {
        const response = await httpClient<WishlistResponse[]>("/wishlist", {
            method: "GET"
        });
        return response.data || [];
    }

    async addToWishlist(courseId: number): Promise<WishlistResponse> {
        const response = await httpClient<WishlistResponse>(`/wishlist/${courseId}`, {
            method: "POST"
        });
        if (!response.data) throw new Error("Failed to add to wishlist");
        return response.data;
    }

    async removeFromWishlist(wishlistId: number): Promise<void> {
        await httpClient(`/wishlist/${wishlistId}`, {
            method: "DELETE"
        });
    }

    async isInWishlist(courseId: number): Promise<boolean> {
        const response = await httpClient<boolean>(`/wishlist/check/${courseId}`, {
            method: "GET"
        });
        return !!response.data;
    }
}

export const wishlistService = new WishlistService();
