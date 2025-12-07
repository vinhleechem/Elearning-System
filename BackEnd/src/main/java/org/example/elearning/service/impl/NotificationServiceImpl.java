package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.NotificationResponse;
import org.example.elearning.entity.NotificationEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.NotificationRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {
    NotificationRepository notificationRepository;
    UserRepository userRepository;

    @Override
    public Page<NotificationResponse> getMyNotifications(Pageable pageable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        Page<NotificationEntity> notifications = notificationRepository.findByUser(user, pageable);

        return notifications.map(this::mapToNotificationResponse);
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

        return mapToNotificationResponse(notification);
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

    private NotificationResponse mapToNotificationResponse(NotificationEntity notification) {
        return NotificationResponse.builder()
                .notificationId(notification.getNotificationId())
                .type(notification.getType())
                .title(notification.getTitle())
                .message(notification.getMessage())
                .isRead(notification.getIsRead())
                .createdAt(notification.getCreatedAt())
                .build();
    }
}

