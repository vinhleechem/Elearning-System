package org.example.elearning.mapper;

import org.example.elearning.dto.response.ReviewResponse;
import org.example.elearning.entity.ReviewEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ReviewMapper {
    
    @Mapping(source = "reviewId", target = "reviewId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "user.userId", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    @Mapping(source = "user.avatarUrl", target = "userAvatar")
    @Mapping(source = "rating", target = "rating")
    @Mapping(source = "comment", target = "comment")
    @Mapping(source = "createdAt", target = "createdAt")
    ReviewResponse toResponse(ReviewEntity review);
}
