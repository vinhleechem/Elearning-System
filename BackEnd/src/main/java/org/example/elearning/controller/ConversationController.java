package org.example.elearning.controller;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.ConversationResponse;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import static org.example.elearning.dto.response.StandardResponse.*;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.service.ConversationService;
import org.example.elearning.service.UserService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ConversationController {

    private final ConversationService conversationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<StandardResponse<PaginatedResponse<ConversationResponse>>> getConversations(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean archived
    ) {
        Pageable pageable = PageRequest.of(page, size);
        UserEntity user = userService.getUserByEmail(email);
        PaginatedResponse<ConversationResponse> response = conversationService.getMyConversations(
                user.getUserId(),
                courseId,
                keyword,
                archived,
                pageable
        );
        return ResponseEntity.ok(success("Lấy danh sách conversations thành công", response));
    }
    
    @GetMapping("/unread-count")
    public ResponseEntity<StandardResponse<Long>> getUnreadCount(@AuthenticationPrincipal String email) {
        UserEntity user = userService.getUserByEmail(email);
        Long count = conversationService.getUnreadCount(user.getUserId());
        return ResponseEntity.ok(success("Lấy số lượng tin nhắn chưa đọc thành công", count));
    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<StandardResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        conversationService.markAsRead(id, user.getUserId());

        return ResponseEntity.ok(
                StandardResponse.<Void>builder()
                        .message("Đã đánh dấu đã đọc")
                        .build()
        );
    }
    @PutMapping("/{id}/archive")
    public ResponseEntity<StandardResponse<Void>> archiveConversation(
            @PathVariable Long id,
            @RequestParam(required = false) boolean archived
    ) {
        String message = archived
                ? "Đã lưu trữ conversation"
                : "Đã bỏ lưu trữ conversation";
        conversationService.setConversationArchived(id,archived);

        return ResponseEntity.ok(
                StandardResponse.<Void>builder()
                        .message(message)
                        .build()
        );
    }
    @GetMapping("/archived")
    public ResponseEntity<StandardResponse<PaginatedResponse<ConversationResponse>>> getArchivedConversations(
            @AuthenticationPrincipal String email,
            Pageable pageable
    ) {
        UserEntity user = userService.getUserByEmail(email);
        PaginatedResponse<ConversationResponse> response = conversationService.getMyConversations(
                user.getUserId(),
                null,  // courseId
                null,  // keyword
                true,  // archived
                pageable
        );
        return ResponseEntity.ok(
                StandardResponse.<PaginatedResponse<ConversationResponse>>builder()
                        .message("Lấy danh sách archived conversations thành công")
                        .data(response)
                        .build()
        );
    }

    @PostMapping("/course/{courseId}")
    public ResponseEntity<StandardResponse<ConversationResponse>> getOrCreateConversation(
            @PathVariable Long courseId,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        ConversationResponse response = conversationService.createConversation(user.getUserId(), courseId);
        
        return ResponseEntity.ok(
                StandardResponse.<ConversationResponse>builder()
                        .message("Lấy conversation thành công")
                        .data(response)
                        .build()
        );
    }

    // ========== INSTRUCTOR ENDPOINTS ==========
    
    @GetMapping("/instructor")
    public ResponseEntity<StandardResponse<PaginatedResponse<ConversationResponse>>> getInstructorConversations(
            @AuthenticationPrincipal String email,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean archived
    ) {
        Pageable pageable = PageRequest.of(page, size);
        UserEntity user = userService.getUserByEmail(email);
        
        PaginatedResponse<ConversationResponse> response = conversationService.getMyConversations(
                user.getUserId(),
                courseId,
                keyword,
                archived,
                pageable
        );
        
        return ResponseEntity.ok(
                StandardResponse.<PaginatedResponse<ConversationResponse>>builder()
                        .message("Lấy danh sách conversations thành công")
                        .data(response)
                        .build()
        );
    }

    /**
     * Mark conversation as read for instructor
     */
    @PutMapping("/instructor/{id}/mark-read")
    public ResponseEntity<StandardResponse<Void>> markAsReadForInstructor(
            @PathVariable Long id,
            @AuthenticationPrincipal String email
    ) {
        UserEntity user = userService.getUserByEmail(email);
        conversationService.markAsRead(id, user.getUserId());
        
        return ResponseEntity.ok(
                StandardResponse.<Void>builder()
                        .message("Đã đánh dấu đã đọc")
                        .build()
        );
    }

}
