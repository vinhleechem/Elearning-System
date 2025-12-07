package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.WishlistResponse;
import org.example.elearning.service.WishlistService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/wishlist")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Wishlist", description = "APIs quản lý danh sách yêu thích - Dành cho STUDENT")
@PreAuthorize("hasRole('STUDENT')")
public class WishlistController {
    WishlistService wishlistService;

    @GetMapping
    @Operation(summary = "Lấy danh sách yêu thích của tôi")
    public ApiResponse<List<WishlistResponse>> getMyWishlist() {
        return ApiResponse.<List<WishlistResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách yêu thích thành công")
                .data(wishlistService.getMyWishlist())
                .build();
    }

    @PostMapping("/{courseId}")
    @Operation(summary = "Thêm khóa học vào danh sách yêu thích")
    public ApiResponse<WishlistResponse> addToWishlist(@PathVariable Long courseId) {
        return ApiResponse.<WishlistResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thêm vào danh sách yêu thích thành công")
                .data(wishlistService.addToWishlist(courseId))
                .build();
    }

    @DeleteMapping("/{wishlistId}")
    @Operation(summary = "Xóa khóa học khỏi danh sách yêu thích")
    public ApiResponse<Void> removeFromWishlist(@PathVariable Long wishlistId) {
        wishlistService.removeFromWishlist(wishlistId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa khỏi danh sách yêu thích thành công")
                .build();
    }

    @GetMapping("/check/{courseId}")
    @Operation(summary = "Kiểm tra khóa học có trong wishlist không")
    public ApiResponse<Boolean> isInWishlist(@PathVariable Long courseId) {
        return ApiResponse.<Boolean>builder()
                .code(HttpStatus.OK.value())
                .message("Kiểm tra thành công")
                .data(wishlistService.isInWishlist(courseId))
                .build();
    }
}

