package org.example.elearning.controller;

import org.example.elearning.dto.response.ApiResponse;
import org.example.elearning.dto.response.NotificationResponse;
import org.example.elearning.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Notification", description = "APIs quản lý thông báo - Tất cả user đã đăng nhập")
@PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
public class NotificationController {
    NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo")
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(Pageable pageable) {
        return ApiResponse.<Page<NotificationResponse>>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy danh sách thông báo thành công")
                .data(notificationService.getMyNotifications(pageable))
                .build();
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable Long notificationId) {
        return ApiResponse.<NotificationResponse>builder()
                .code(HttpStatus.OK.value())
                .message("Đánh dấu đã đọc thành công")
                .data(notificationService.markAsRead(notificationId))
                .build();
    }

    @PutMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public ApiResponse<Void> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Đánh dấu tất cả đã đọc thành công")
                .build();
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Xóa thông báo")
    public ApiResponse<Void> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ApiResponse.<Void>builder()
                .code(HttpStatus.OK.value())
                .message("Xóa thông báo thành công")
                .build();
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.<Long>builder()
                .code(HttpStatus.OK.value())
                .message("Lấy số lượng thành công")
                .data(notificationService.getUnreadCount())
                .build();
    }
}

