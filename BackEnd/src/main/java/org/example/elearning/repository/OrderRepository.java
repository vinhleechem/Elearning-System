package org.example.elearning.repository;

import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long> {

    List<OrderEntity> findByUserAndStatus(UserEntity user, OrderStatus status);

    Page<OrderEntity> findByUser(UserEntity user, Pageable pageable);
}


