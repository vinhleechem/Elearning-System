package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.AddToCartRequest;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.CartResponse;
import org.example.elearning.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Cart", description = "APIs quản lý giỏ hàng - Dành cho STUDENT")
@PreAuthorize("hasRole('STUDENT')")
public class CartController {
    CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy giỏ hàng của tôi")
    public ApiResponse<CartResponse> getMyCart() {
        return ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy giỏ hàng thành công")
                .data(cartService.getMyCart())
                .build();
    }

    @PostMapping("/add")
    @Operation(summary = "Thêm khóa học vào giỏ hàng")
    public ApiResponse<CartResponse> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ApiResponse.<CartResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Thêm vào giỏ hàng thành công")
                .data(cartService.addToCart(request.getCourseId()))
                .build();
    }

    @DeleteMapping("/{courseId}")
    @Operation(summary = "Xóa khóa học khỏi giỏ hàng")
    public ApiResponse<Void> removeFromCart(@PathVariable Long courseId) {
        cartService.removeFromCart(courseId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa khỏi giỏ hàng thành công")
                .build();
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Xóa toàn bộ giỏ hàng")
    public ApiResponse<Void> clearCart() {
        cartService.clearCart();
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa giỏ hàng thành công")
                .build();
    }
}

