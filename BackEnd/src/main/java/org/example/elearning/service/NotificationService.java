package org.example.elearning.service;

import org.example.elearning.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    NotificationResponse markAsRead(Long notificationId);

    void markAllAsRead();

    void deleteNotification(Long notificationId);

    Long getUnreadCount();
}
