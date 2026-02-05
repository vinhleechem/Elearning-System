package org.example.elearning.mapper;

import org.example.elearning.dto.response.WishlistResponse;
import org.example.elearning.entity.WishlistEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface WishlistMapper {
    @Mapping(source = "wishlistId", target = "wishlistId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "course.thumbnailUrl", target = "courseImage")
    @Mapping(source = "course.price", target = "price")
    @Mapping(source = "course.instructor.user.fullName", target = "instructorName")
    @Mapping(source = "createdAt", target = "addedAt")
    WishlistResponse toResponse(WishlistEntity wishlist);
}
