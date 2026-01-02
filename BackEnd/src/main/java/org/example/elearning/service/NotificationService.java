package org.example.elearning.service;

import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.NotificationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface NotificationService {
    Page<NotificationResponse> getMyNotifications(Pageable pageable);

    NotificationResponse markAsRead(Long notificationId);

    void markAllAsRead();

    void deleteNotification(Long notificationId);

    Long getUnreadCount();

    // WebSocket methods
    void sendNotificationToUser(NotificationRequest request);

    void broadcastNotification(NotificationRequest request);

    NotificationResponse createNotificationResponse(NotificationRequest request);

    // Save to DB and send realtime
    void createAndSendNotification(NotificationRequest request);

    // Admin methods
    Page<NotificationResponse> getAllNotifications(Pageable pageable, Long userId, String userName, Boolean isRead);

    void deleteNotificationByAdmin(Long notificationId);
}
