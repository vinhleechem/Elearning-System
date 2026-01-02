package org.example.elearning.controller;

import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.NotificationResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.success;
import org.example.elearning.service.NotificationService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasAnyRole('STUDENT', 'INSTRUCTOR', 'ADMIN')")
public class NotificationController {
    NotificationService notificationService;

    @GetMapping
    @Operation(summary = "Lấy danh sách thông báo")
    public ResponseEntity<StandardResponse<PaginatedResponse<NotificationResponse>>> getMyNotifications(Pageable pageable) {
        Page<NotificationResponse> page = notificationService.getMyNotifications(pageable);
        PaginatedResponse<NotificationResponse> result = PaginatedResponse.<NotificationResponse>builder()
                .data(page.getContent())
                .pagination(PaginatedResponse.Pagination.builder()
                        .pageNo(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(success("Lấy danh sách thông báo thành công", result));
    }

    @PutMapping("/{notificationId}/read")
    @Operation(summary = "Đánh dấu thông báo đã đọc")
    public ResponseEntity<StandardResponse<NotificationResponse>> markAsRead(@PathVariable Long notificationId) {
        NotificationResponse result = notificationService.markAsRead(notificationId);
        return ResponseEntity.ok(success("Đánh dấu đã đọc thành công", result));
    }

    @PutMapping("/read-all")
    @Operation(summary = "Đánh dấu tất cả thông báo đã đọc")
    public ResponseEntity<StandardResponse<Void>> markAllAsRead() {
        notificationService.markAllAsRead();
        return ResponseEntity.ok(success("Đánh dấu tất cả đã đọc thành công", null));
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Xóa thông báo")
    public ResponseEntity<StandardResponse<Void>> deleteNotification(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.ok(success("Xóa thông báo thành công", null));
    }

    @GetMapping("/unread-count")
    @Operation(summary = "Lấy số lượng thông báo chưa đọc")
    public ResponseEntity<StandardResponse<Long>> getUnreadCount() {
        Long count = notificationService.getUnreadCount();
        return ResponseEntity.ok(success("Lấy số lượng thành công", count));
    }

    // ============= WebSocket Methods =============

    @PostMapping("/send")
    @Operation(summary = "Gửi thông báo realtime cho user")
    public ResponseEntity<StandardResponse<Void>> sendNotificationToUser(@RequestBody NotificationRequest request) {
        notificationService.sendNotificationToUser(request);
        return ResponseEntity.ok(success("Gửi thông báo thành công", null));
    }

    @PostMapping("/broadcast")
    @Operation(summary = "Broadcast thông báo cho tất cả users")
    public ResponseEntity<StandardResponse<Void>> broadcastNotification(@RequestBody NotificationRequest request) {
        notificationService.broadcastNotification(request);
        return ResponseEntity.ok(success("Broadcast thông báo thành công", null));
    }

    @MessageMapping("/notify")
    @SendTo("/topic/notifications")
    public NotificationResponse handleNotification(NotificationRequest request) {
        return notificationService.createNotificationResponse(request);
    }

    // ============= Admin Methods =============

    @GetMapping("/admin")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Lấy tất cả thông báo với filter")
    public ResponseEntity<StandardResponse<PaginatedResponse<NotificationResponse>>> getAllNotifications(
            Pageable pageable,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String userName,
            @RequestParam(required = false) Boolean isRead) {
        Page<NotificationResponse> page = notificationService.getAllNotifications(pageable, userId, userName, isRead);
        PaginatedResponse<NotificationResponse> result = PaginatedResponse.<NotificationResponse>builder()
                .data(page.getContent())
                .pagination(PaginatedResponse.Pagination.builder()
                        .pageNo(page.getNumber())
                        .pageSize(page.getSize())
                        .totalElements(page.getTotalElements())
                        .totalPages(page.getTotalPages())
                        .build())
                .build();
        return ResponseEntity.ok(success("Lấy danh sách thông báo thành công", result));
    }

    @DeleteMapping("/admin/{notificationId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Xóa thông báo")
    public ResponseEntity<StandardResponse<Void>> deleteNotificationByAdmin(@PathVariable Long notificationId) {
        notificationService.deleteNotificationByAdmin(notificationId);
        return ResponseEntity.ok(success("Xóa thông báo thành công", null));
    }

    @PostMapping("/admin/send")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Gửi thông báo cho user (lưu DB + realtime)")
    public ResponseEntity<StandardResponse<Void>> adminSendNotification(@RequestBody NotificationRequest request) {
        notificationService.createAndSendNotification(request);
        return ResponseEntity.ok(success("Gửi thông báo thành công", null));
    }

    @PostMapping("/admin/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin: Broadcast thông báo cho tất cả users")
    public ResponseEntity<StandardResponse<Void>> adminBroadcastNotification(@RequestBody NotificationRequest request) {
        notificationService.broadcastNotification(request);
        return ResponseEntity.ok(success("Broadcast thông báo thành công", null));
    }
}
