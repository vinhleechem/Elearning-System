package org.example.elearning.mapper;

import org.example.elearning.dto.response.OrderItemResponse;
import org.example.elearning.dto.response.OrderResponse;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.OrderItemEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring")
public interface OrderMapper {
    
    @Mapping(source = "order.orderId", target = "orderId")
    @Mapping(source = "order.user.userId", target = "userId")
    @Mapping(source = "order.user.fullName", target = "userName")
    @Mapping(source = "items", target = "items")
    @Mapping(source = "order.totalAmount", target = "totalAmount")
    @Mapping(source = "order.discountAmount", target = "discountAmount")
    @Mapping(source = "order.finalAmount", target = "finalAmount")
    @Mapping(source = "order.status", target = "status")
    @Mapping(source = "order.createdAt", target = "createdAt")
    OrderResponse toOrderResponse(OrderEntity order, List<OrderItemEntity> items);
    
    @Mapping(source = "orderItemId", target = "orderItemId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "course.thumbnailUrl", target = "courseImage")
    @Mapping(source = "price", target = "price")
    @Mapping(source = "discountPrice", target = "discountPrice")
    @Mapping(source = "finalPrice", target = "finalPrice")
    OrderItemResponse toOrderItemResponse(OrderItemEntity orderItem);
}
