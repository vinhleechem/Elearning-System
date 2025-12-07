package org.example.elearning.mapper;

import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.entity.CategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CategoryMapper {

    @Mapping(target = "parentId",
             expression = "java(entity.getParent() != null ? entity.getParent().getId() : null)")
    CategoryResponse toResponse(CategoryEntity entity);
}


