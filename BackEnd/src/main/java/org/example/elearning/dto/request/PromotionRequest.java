package org.example.elearning.dto.request;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.elearning.enums.PromotionType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
public class PromotionRequest {

    @NotBlank(message = "Promotion name is required")
    private String name;

    private String description;

    @NotNull(message = "Promotion type is required")
    private PromotionType promotionType;

    @NotNull(message = "Start date is required")
    private LocalDateTime startDate;

    @NotNull(message = "End date is required")
    private LocalDateTime endDate;

    private Boolean isActive = true;

    private Integer priority = 0;

    @Valid
    @NotNull(message = "At least one rule is required")
    private List<PromotionRuleRequest> rules = new ArrayList<>();
}
