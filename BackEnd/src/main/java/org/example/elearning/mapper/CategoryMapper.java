package org.example.elearning.mapper;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.entity.CategoryEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring")
public interface CategoryMapper {

    @Mapping(target = "parentId",
             expression = "java(entity.getParent() != null ? entity.getParent().getId() : null)")
    @Mapping(target = "children", source = "children")
    CategoryResponse toResponse(CategoryEntity entity);

    List<CategoryResponse> toResponseList(List<CategoryEntity> entities);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "parent", ignore = true)
    @Mapping(target = "level", ignore = true)
    @Mapping(target = "children", ignore = true)
    CategoryEntity toEntity(CategoryRequest request);
}


