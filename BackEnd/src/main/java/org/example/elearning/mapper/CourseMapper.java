package org.example.elearning.mapper;

import java.util.List;

import org.example.elearning.dto.request.AdminCourseRequest;
import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.request.InstructorCourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.entity.CourseEntity;
import org.mapstruct.BeanMapping;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;
import org.mapstruct.NullValuePropertyMappingStrategy;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring")
public interface CourseMapper {

    @Mapping(target = "instructorId", source = "instructor.instructorId")
    @Mapping(target = "instructorName", source = "instructor.user.fullName")
    @Mapping(target = "categoryId", source = "category.id")
    @Mapping(target = "categoryName", source = "category.name")
    @Mapping(target = "discountPrice", source = "currentPrice")
    CourseResponse toResponse(CourseEntity entity);

    List<CourseResponse> toResponseList(List<CourseEntity> entities);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "category", ignore = true)
    CourseEntity toEntity(AdminCourseRequest request);


    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "category", ignore = true)
    CourseEntity toEntity(InstructorCourseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    void updateEntity(@MappingTarget CourseEntity entity, CourseRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "instructor", ignore = true)
    @Mapping(target = "category", ignore = true)
    @Mapping(target = "slug", ignore = true)
    void updateEntity(@MappingTarget CourseEntity entity, CourseUpdateRequest request);
}


