package org.example.elearning.mapper;

import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.example.elearning.dto.response.PromotionRuleResponse;
import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.entity.PromotionRuleEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface PromotionMapper {

    @Mapping(target = "rulesCount", expression = "java(entity.getRules() != null ? entity.getRules().size() : 0)")
    @Mapping(target = "updatedAt", source = "updated_At")
    PromotionResponse toResponse(PromotionEntity entity);

    @Mapping(target = "updatedAt", source = "updated_At")
    PromotionDetailResponse toDetailResponse(PromotionEntity entity);

    List<PromotionResponse> toResponseList(List<PromotionEntity> entities);

    @Mapping(target = "promotionId", ignore = true)
    @Mapping(target = "rules", ignore = true)
    PromotionEntity toEntity(PromotionRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "promotionId", ignore = true)
    @Mapping(target = "rules", ignore = true)
    void updateEntity(@MappingTarget PromotionEntity entity, PromotionRequest request);

    // Map PromotionRule
    @Mapping(target = "targetName", expression = "java(getTargetName(rule))")
    PromotionRuleResponse toRuleResponse(PromotionRuleEntity rule);

    default String getTargetName(PromotionRuleEntity rule) {
        if (rule.getRuleType() == null) {
            return null;
        }
        
        switch (rule.getRuleType()) {
            case COURSE:
                return rule.getTargetId() != null ? "Course ID: " + rule.getTargetId() : null;
            case CATEGORY:
                return rule.getTargetId() != null ? "Category ID: " + rule.getTargetId() : null;
            case ALL:
            default:
                return "Tất cả";
        }
    }
}
