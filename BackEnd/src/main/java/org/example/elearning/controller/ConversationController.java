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
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestParam(required = false) int page,
            @RequestParam(required = false) int size
            ) {
        Pageable pageable = PageRequest.of(page, size);
        UserEntity user = userService.getUserByEmail(userDetails.getUsername());
        PaginatedResponse<ConversationResponse> response = conversationService.getMyConversations(user.getUserId(), false, pageable);
        return ResponseEntity.ok(success("Lấy danh sách conversations thành công",response));

    }

    @PutMapping("/{id}/mark-read")
    public ResponseEntity<StandardResponse<Void>> markAsRead(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        UserEntity user = userService.getUserByEmail(userDetails.getUsername());
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
            @AuthenticationPrincipal UserDetails userDetails,
            Pageable pageable
    ) {
        UserEntity user = userService.getUserByEmail(userDetails.getUsername());
        PaginatedResponse<ConversationResponse> response = conversationService.getMyConversations(
                user.getUserId(),
                true,
                pageable
        );
        return ResponseEntity.ok(
                StandardResponse.<PaginatedResponse<ConversationResponse>>builder()
                        .message("Lấy danh sách archived conversations thành công")
                        .data(response)
                        .build()
        );
    }

}
