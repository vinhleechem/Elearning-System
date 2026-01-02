package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.NotificationResponse;
import org.example.elearning.entity.NotificationEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.NotificationType;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.NotificationMapper;
import org.example.elearning.repository.NotificationRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    UserRepository userRepository;
    SimpMessagingTemplate messagingTemplate;
    NotificationMapper notificationMapper;

    @Override
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        Page<NotificationEntity> notifications = notificationRepository.findByUser(user, pageable);

        return notifications.map(notificationMapper::toResponse);
    }

    @Override
    @Transactional
    public NotificationResponse markAsRead(Long notificationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException("Bạn không có quyền truy cập thông báo này");
        }

        notification.setIsRead(true);
        notification = notificationRepository.save(notification);

        return notificationMapper.toResponse(notification);
    }

    @Override
    @Transactional
    public void markAllAsRead() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        List<NotificationEntity> notifications = notificationRepository.findByUserAndIsReadFalse(user);

        notifications.forEach(notification -> notification.setIsRead(true));
        notificationRepository.saveAll(notifications);
    }

    @Override
    @Transactional
    public void deleteNotification(Long notificationId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));

        if (!notification.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException("Bạn không có quyền xóa thông báo này");
        }

        notificationRepository.delete(notification);
    }

    @Override
    public Long getUnreadCount() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        return notificationRepository.countByUserAndIsReadFalse(user);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    // ============= WebSocket Methods =============

    @Override
    public void sendNotificationToUser(NotificationRequest request) {
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        NotificationResponse notification = notificationMapper.toResponse(request);
        System.out.println("Sending WS notification to user: " + user.getEmail());
        messagingTemplate.convertAndSendToUser(
            user.getEmail(),
            "/queue/notifications",
            notification
        );
    }

    @Override
    public void broadcastNotification(NotificationRequest request) {
        NotificationResponse notification = notificationMapper.toResponse(request);
        messagingTemplate.convertAndSend("/topic/notifications", notification);
    }

    @Override
    public NotificationResponse createNotificationResponse(NotificationRequest request) {
        return notificationMapper.toResponse(request);
    }

    @Override
    @Transactional
    public void createAndSendNotification(NotificationRequest request) {
        // 1. Lưu vào database
        UserEntity user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
        
        NotificationEntity notification = NotificationEntity.builder()
                .user(user)
                .type(NotificationType.valueOf(request.getType()))
                .title(request.getTitle())
                .message(request.getMessage())
                .link(request.getLink())
                .isRead(false)
                .build();
        
        notification = notificationRepository.save(notification);
        
        // 2. Gửi realtime qua WebSocket
        NotificationResponse response = notificationMapper.toResponse(notification);
        
        System.out.println("=== WebSocket Notification Debug ===");
        System.out.println("Sending to user: " + user.getEmail());
        System.out.println("Destination: /topic/notifications (BROADCAST TEST)");
        System.out.println("Message: " + response);
        System.out.println("====================================");
        
        // TEMPORARY: Use broadcast instead of user-specific
        // SimpleBroker doesn't support user destination resolution properly
        // TODO: Switch to StompBrokerRelay (RabbitMQ/ActiveMQ) for production
        messagingTemplate.convertAndSend(
            "/topic/notifications",
            response
        );
        
        System.out.println("✅ Message sent via SimpMessagingTemplate to /topic/notifications");
    }

    // ============= Admin Methods =============

    @Override
    public Page<NotificationResponse> getAllNotifications(Pageable pageable, Long userId, String userName, Boolean isRead) {
        Page<NotificationEntity> notifications;

        if (userId != null && isRead != null) {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
            notifications = notificationRepository.findByUserAndIsReadAndIsDeletedFalse(user, isRead, pageable);
        } else if (userId != null) {
            UserEntity user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
            notifications = notificationRepository.findByUserAndIsDeletedFalse(user, pageable);
        } else if (userName != null && isRead != null) {
            notifications = notificationRepository.findByUserFullNameContainingAndIsReadAndIsDeletedFalse(userName, isRead, pageable);
        } else if (userName != null) {
            notifications = notificationRepository.findByUserFullNameContainingAndIsDeletedFalse(userName, pageable);
        } else if (isRead != null) {
            notifications = notificationRepository.findByIsReadAndIsDeletedFalse(isRead, pageable);
        } else {
            notifications = notificationRepository.findByIsDeletedFalse(pageable);
        }

        return notifications.map(notificationMapper::toResponse);
    }

    @Override
    @Transactional
    public void deleteNotificationByAdmin(Long notificationId) {
        NotificationEntity notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy thông báo"));
        notification.setDeleted(true);
        notificationRepository.save(notification);
    }
}
