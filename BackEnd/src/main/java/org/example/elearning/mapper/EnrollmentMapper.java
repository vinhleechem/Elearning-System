package org.example.elearning.mapper;

import org.example.elearning.dto.response.EnrollmentResponse;
import org.example.elearning.entity.EnrollmentEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface EnrollmentMapper {
    
    @Mapping(source = "enrollmentId", target = "enrollmentId")
    @Mapping(source = "course.courseId", target = "courseId")
    @Mapping(source = "course.title", target = "courseTitle")
    @Mapping(source = "course.thumbnailUrl", target = "courseImage")
    @Mapping(source = "course.instructor.user.fullName", target = "instructorName")
    @Mapping(source = "progress", target = "progress")
    @Mapping(source = "enrolledAt", target = "enrolledAt")
    @Mapping(source = "course.slug", target = "slug")
    @Mapping(target = "totalLessons", constant = "0")
    @Mapping(target = "completedLessons", constant = "0")
    EnrollmentResponse toResponse(EnrollmentEntity enrollment);
}
