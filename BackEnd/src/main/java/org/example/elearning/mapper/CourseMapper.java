package org.example.elearning.mapper;

import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.entity.CourseEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface CourseMapper {

    @Mapping(target = "instructorId", source = "instructor.instructorId")
    @Mapping(target = "categoryId", source = "category.id")
    CourseResponse toResponse(CourseEntity entity);
}


