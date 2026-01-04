package org.example.elearning.service;


import org.example.elearning.dto.request.CreateOrderRequest;
import org.example.elearning.dto.response.OrderResponse;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.OrderItemEntity;
import org.example.elearning.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderService {
    void cancelOrder(Long orderId);
    Page<OrderResponse> getMyOrders(Pageable pageable);
    OrderResponse getOrderById(Long orderId);
    OrderResponse createOrder(CreateOrderRequest request);
    Page<OrderResponse> getAllOrders(String search, OrderStatus status, LocalDateTime fromDate, LocalDateTime toDate, Pageable pageable);
    
    // For internal service usage
    OrderEntity getOrderEntityById(Long orderId);
    List<OrderItemEntity> getOrderItemsByOrder(OrderEntity order);
    void updateOrderStatus(OrderEntity order, OrderStatus status);
}


