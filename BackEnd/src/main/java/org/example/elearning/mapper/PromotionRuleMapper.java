package org.example.elearning.mapper;

import org.example.elearning.dto.request.PromotionRuleRequest;
import org.example.elearning.entity.PromotionRuleEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface PromotionRuleMapper {

    @Mapping(target = "promotion", ignore = true)
    PromotionRuleEntity toEntity(PromotionRuleRequest promotionRuleRequest);
}
