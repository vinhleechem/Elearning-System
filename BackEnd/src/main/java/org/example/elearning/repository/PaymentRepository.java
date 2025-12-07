package org.example.elearning.repository;

import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.PaymentEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<PaymentEntity, Long> {

    List<PaymentEntity> findByOrder(OrderEntity order);
}


