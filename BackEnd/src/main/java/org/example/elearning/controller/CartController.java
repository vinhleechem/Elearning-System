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
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.CartService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/cart")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Cart", description = "APIs quản lý giỏ hàng - Dành cho STUDENT")
public class CartController {
    CartService cartService;

    @GetMapping
    @Operation(summary = "Lấy giỏ hàng của tôi")
    public ResponseEntity<StandardResponse<Object>>  getMyCart() {
        return ResponseEntity.ok(
                StandardResponse.success(
                        "Lấy giỏ hàng thành công",
                        cartService.getMyCart()
                )
        );
    }

    @PostMapping("/add")
    @Operation(summary = "Thêm khóa học vào giỏ hàng")
    public ResponseEntity<StandardResponse<Object>> addToCart(@Valid @RequestBody AddToCartRequest request) {
        return ResponseEntity.ok(
                StandardResponse.success(
                        "Thêm vào giỏ hàng thành công",
                        cartService.addToCart(request.getCourseId())
                )
        );
    }

    @DeleteMapping("/{courseId}")
    @Operation(summary = "Xóa khóa học khỏi giỏ hàng")
    public ResponseEntity<StandardResponse<Object>> removeFromCart(@PathVariable Long courseId) {
        cartService.removeFromCart(courseId);
        return ResponseEntity.ok(
                StandardResponse.success(
                        "Xóa khỏi giỏ hàng thành công"
                )
        );
    }

    @DeleteMapping("/clear")
    @Operation(summary = "Xóa toàn bộ giỏ hàng")
    public ResponseEntity<StandardResponse<Object>> clearCart() {
        cartService.clearCart();
        return ResponseEntity.ok(
                StandardResponse.success(
                        "Xóa giỏ hàng thành công"
                )
        );
    }
}

