package org.example.elearning.repository;

import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.OrderItemEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderItemRepository extends JpaRepository<OrderItemEntity, Long> {

    List<OrderItemEntity> findByOrder(OrderEntity order);
}


