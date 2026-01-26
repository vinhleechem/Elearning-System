package org.example.elearning.controller.admin;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.ConversationResponse;
import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.ConversationService;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/v1/admin/conversations")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AdminConversationController {

    ConversationService conversationService;

    @GetMapping
    public ResponseEntity<StandardResponse<PaginatedResponse<ConversationResponse>>> getAllConversations(
            @RequestParam(required = false) Long courseId,
            @RequestParam(required = false) Long instructorId,
            @RequestParam(required = false) Long studentId,
            @RequestParam(required = false) Boolean isArchived,
            @RequestParam(required = false) Boolean isLocked,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @RequestParam(required = false) String keyword,
            Pageable pageable
    ) {
        return ResponseEntity.ok(
                StandardResponse.success(
                        conversationService.getAllConversations(
                                courseId, instructorId, studentId, isArchived, isLocked,
                                startDate, endDate, keyword, pageable
                        )
                )
        );
    }


    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<ConversationResponse>> getConversationDetail(
            @PathVariable Long id
    ) {
        return ResponseEntity.ok(
                StandardResponse.success(conversationService.getConversationDetail(id))
        );
    }

    @PutMapping("/{id}/lock")
    public ResponseEntity<StandardResponse<Void>> lockConversation(@PathVariable Long id) {
        conversationService.setConversationLocked(id, true);
        return ResponseEntity.ok(StandardResponse.success("Đã khóa cuộc trò chuyện"));
    }


    @PutMapping("/{id}/unlock")
    public ResponseEntity<StandardResponse<Void>> unlockConversation(@PathVariable Long id) {
        conversationService.setConversationLocked(id, false);
        return ResponseEntity.ok(StandardResponse.success("Đã mở khóa cuộc trò chuyện"));
    }
}