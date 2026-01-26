package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.SendMessageRequest;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.service.MessageService;
import org.example.elearning.service.UserService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/messages")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Tag(name = "Message", description = "APIs quản lý tin nhắn trong conversation")
public class MessageController {

    MessageService messageService;
    UserService userService;

    /**
     * Gửi tin nhắn mới trong conversation
     * POST /api/v1/messages
     */
    @PostMapping
    @Operation(summary = "Gửi tin nhắn mới", 
               description = "Gửi tin nhắn trong conversation giữa student và instructor")
    public ResponseEntity<StandardResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        MessageResponse response = messageService.sendMessage(request, user.getUserId());
        
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(success("Gửi tin nhắn thành công", response));
    }

    /**
     * Lấy danh sách tin nhắn trong conversation
     * GET /api/v1/messages?conversationId=123&page=0&size=20
     */
    @GetMapping
    @Operation(summary = "Lấy danh sách tin nhắn", 
               description = "Lấy danh sách tin nhắn trong conversation với phân trang")
    public ResponseEntity<StandardResponse<PaginatedResponse<MessageResponse>>> getMessages(
            @RequestParam Long conversationId,
            @AuthenticationPrincipal String email,
            Pageable pageable
    ) {
        UserEntity user = userService.getUserByEmail(email);
        PaginatedResponse<MessageResponse> response = messageService.getMessages(
                conversationId, 
                user.getUserId(), 
                pageable
        );
        
        return ResponseEntity.ok(success("Lấy danh sách tin nhắn thành công", response));
    }

    /**
     * Đánh dấu tất cả tin nhắn trong conversation là đã đọc
     * PUT /api/v1/messages/conversations/{conversationId}/mark-read
     */
    @PutMapping("/conversations/{conversationId}/mark-read")
    @Operation(summary = "Đánh dấu tin nhắn đã đọc", 
               description = "Đánh dấu tất cả tin nhắn trong conversation là đã đọc")
    public ResponseEntity<StandardResponse<Void>> markMessagesAsRead(
            @PathVariable Long conversationId,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        messageService.markMessagesAsRead(conversationId, user.getUserId());
        
        return ResponseEntity.ok(success("Đã đánh dấu tất cả tin nhắn là đã đọc", null));
    }

    /**
     * Xóa tin nhắn (chỉ người gửi hoặc admin)
     * DELETE /api/v1/messages/{messageId}
     */
    @DeleteMapping("/{messageId}")
    @Operation(summary = "Xóa tin nhắn", 
               description = "User chỉ có thể xóa tin nhắn của chính mình, Admin có thể xóa bất kỳ tin nhắn nào")
    public ResponseEntity<StandardResponse<Void>> deleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        
        // Check if user is admin
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> "ROLE_ADMIN".equals(role.getRoleName()));
        
        messageService.deleteMessage(messageId, user.getUserId(), isAdmin);
        
        return ResponseEntity.ok(success("Xóa tin nhắn thành công", null));
    }

    /**
     * Admin xóa tin nhắn bất kỳ
     * DELETE /api/v1/messages/admin/{messageId}
     */
    @DeleteMapping("/admin/{messageId}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Admin xóa tin nhắn", 
               description = "Admin có thể xóa bất kỳ tin nhắn nào")
    public ResponseEntity<StandardResponse<Void>> adminDeleteMessage(
            @PathVariable Long messageId,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        messageService.deleteMessage(messageId, user.getUserId(), true);
        
        return ResponseEntity.ok(success("Admin đã xóa tin nhắn thành công", null));
    }
}
