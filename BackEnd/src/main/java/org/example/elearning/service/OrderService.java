package org.example.elearning.service;


import org.example.elearning.dto.request.CreateOrderRequest;
import org.example.elearning.dto.response.OrderResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface OrderService {
    void cancelOrder(Long orderId);
    Page<OrderResponse> getMyOrders(Pageable pageable);
    OrderResponse getOrderById(Long orderId);
    OrderResponse createOrder(CreateOrderRequest request);

}


