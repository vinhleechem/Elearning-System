import { httpClient } from "./httpClient";
import type { WishlistResponse } from "../types/wishlist";

class WishlistService {
    async getMyWishlist(): Promise<WishlistResponse[]> {
        const response = await httpClient.get<WishlistResponse[]>("/wishlist");
        return response.data;
    }

    async addToWishlist(courseId: number): Promise<WishlistResponse> {
        const response = await httpClient.post<WishlistResponse>(`/wishlist/${courseId}`);
        return response.data;
    }

    async removeFromWishlist(wishlistId: number): Promise<void> {
        await httpClient.delete(`/wishlist/${wishlistId}`);
    }

    async isInWishlist(courseId: number): Promise<boolean> {
        const response = await httpClient.get<boolean>(`/wishlist/check/${courseId}`);
        return response.data;
    }
}

export const wishlistService = new WishlistService();
