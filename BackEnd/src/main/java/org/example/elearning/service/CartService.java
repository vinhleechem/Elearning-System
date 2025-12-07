package org.example.elearning.service;


import org.example.elearning.dto.response.CartResponse;

public interface CartService {
    void clearCart();
    void removeFromCart(Long courseId);
    CartResponse addToCart(Long courseId);
    CartResponse getMyCart();
}


