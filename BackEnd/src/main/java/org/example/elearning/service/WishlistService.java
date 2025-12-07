package org.example.elearning.service;

import org.example.elearning.dto.response.WishlistResponse;

import java.util.List;

public interface WishlistService {
    List<WishlistResponse> getMyWishlist();
    WishlistResponse addToWishlist(Long courseId);
    void removeFromWishlist(Long wishlistId);
    boolean isInWishlist(Long courseId);
}

