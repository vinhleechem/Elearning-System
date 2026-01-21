package org.example.elearning.mapper;

import org.example.elearning.dto.request.UpdateReviewRequest;
import org.example.elearning.dto.response.ReviewResponse;
import org.example.elearning.entity.ReviewEntity;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    
    @Mapping(source = "reviewId", target = "reviewId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    ReviewResponse toResponse(ReviewEntity review);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateEntity(ReviewEntity review,@MappingTarget UpdateReviewRequest reviewResponse);
}
