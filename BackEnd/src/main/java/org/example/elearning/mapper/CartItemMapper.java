package org.example.elearning.mapper;

import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.entity.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface CartItemMapper {
    
    @Mapping(source = "courseId", target = "courseId")
    @Mapping(source = "title", target = "courseTitle")
    @Mapping(source = "thumbnailUrl", target = "courseImage")
    @Mapping(source = "price", target = "price")
    @Mapping(target = "discountPrice", ignore = true)
    CartItemResponse toResponse(CourseEntity course);
}
