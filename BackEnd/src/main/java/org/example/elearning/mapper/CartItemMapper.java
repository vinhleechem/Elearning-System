package org.example.elearning.mapper;

import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.entity.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    
    @Mapping(source = "title", target = "courseTitle")
    @Mapping(source = "thumbnailUrl", target = "courseImage")
    CartItemResponse toResponse(CourseEntity course);
}
