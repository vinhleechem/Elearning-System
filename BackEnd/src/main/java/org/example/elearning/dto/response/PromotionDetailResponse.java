package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;
import org.example.elearning.enums.PromotionType;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
public class PromotionDetailResponse {
    private Long promotionId;
    private String name;
    private String description;
    private PromotionType promotionType;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private Boolean isActive;
    private Integer priority;
    private List<PromotionRuleResponse> rules;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
