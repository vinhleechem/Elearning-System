package org.example.elearning.scheduler;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.enums.OrderStatus;
import org.example.elearning.repository.OrderRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cancels PENDING orders whose VNPay payment URL has expired (15 min).
 * Runs every 5 minutes. Cutoff = 20 minutes to give a small buffer.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class OrderCleanupScheduler {

    private final OrderRepository orderRepository;

    // VNPay URL expires in 15 min → cancel PENDING orders older than 20 min
    private static final int EXPIRY_MINUTES = 20;

    @Scheduled(fixedRate = 5 * 60 * 1000) // every 5 minutes
    @Transactional
    public void cancelExpiredPendingOrders() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(EXPIRY_MINUTES);
        List<OrderEntity> staleOrders = orderRepository
                .findByStatusAndCreatedAtBefore(OrderStatus.PENDING, cutoff);

        if (staleOrders.isEmpty()) return;

        staleOrders.forEach(order -> order.setStatus(OrderStatus.CANCELLED));
        orderRepository.saveAll(staleOrders);

        log.info("[OrderCleanup] Cancelled {} expired PENDING order(s) older than {} minutes",
                staleOrders.size(), EXPIRY_MINUTES);
    }
}
