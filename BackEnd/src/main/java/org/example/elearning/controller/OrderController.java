package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CreateOrderRequest;
import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.OrderResponse;
import org.example.elearning.service.OrderService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Order", description = "APIs quản lý đơn hàng")
public class OrderController {
    OrderService orderService;

    @PostMapping
    @Operation(summary = "Tạo đơn hàng mới")
    public ApiResponse<OrderResponse> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ApiResponse.<OrderResponse>builder()
                .code(HttpStatus.CREATED.value())
                .message("Tạo đơn hàng thành công")
                .data(orderService.createOrder(request))
                .build();
    }

    @GetMapping("/{orderId}")
    @Operation(summary = "Lấy chi tiết đơn hàng")
    public ApiResponse<OrderResponse> getOrderById(@PathVariable Long orderId) {
        return ApiResponse.<OrderResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy chi tiết đơn hàng thành công")
                .data(orderService.getOrderById(orderId))
                .build();
    }

    @GetMapping
    @Operation(summary = "Lấy danh sách đơn hàng của tôi")
    public ApiResponse<Page<OrderResponse>> getMyOrders(Pageable pageable) {
        return ApiResponse.<Page<OrderResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách đơn hàng thành công")
                .data(orderService.getMyOrders(pageable))
                .build();
    }

    @PutMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('STUDENT', 'ADMIN')")
    @Operation(summary = "Hủy đơn hàng - STUDENT hủy đơn của mình, ADMIN có thể hủy bất kỳ")
    public ApiResponse<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Hủy đơn hàng thành công")
                .build();
    }
}

