import { httpClient } from "./httpClient";

export interface CartResponse {
    cartId: number;
    items: CartItemResponse[];
    totalAmount: number;
}

export interface CartItemResponse {
    courseId: number;
    courseTitle: string;
    courseImage: string;
    price: number;
    discountPrice?: number;
}

export const cartService = {
    getMyCart: async () => {
        return httpClient<CartResponse>("/cart");
    },

    addToCart: async (courseId: number) => {
        return httpClient<CartResponse>("/cart/add", {
            method: "POST",
            body: JSON.stringify({ courseId }),
        });
    },

    removeFromCart: async (courseId: number) => {
        return httpClient<void>(`/cart/${courseId}`, {
            method: "DELETE",
        });
    },

    clearCart: async () => {
        return httpClient<void>("/cart/clear", {
            method: "DELETE",
        });
    },
};
