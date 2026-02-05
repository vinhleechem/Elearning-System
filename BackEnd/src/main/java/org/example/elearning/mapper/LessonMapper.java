package org.example.elearning.mapper;

import org.example.elearning.dto.request.LessonRequest;
import org.example.elearning.dto.response.LessonResponse;
import org.example.elearning.entity.LessonEntity;
import org.example.elearning.entity.SectionEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface LessonMapper {

    LessonResponse toResponse(LessonEntity entity);

    List<LessonResponse> toResponseList(List<LessonEntity> entities);

    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "section", ignore = true)
    LessonEntity toEntity(LessonRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "lessonId", ignore = true)
    @Mapping(target = "section", ignore = true)
    void updateEntity(@MappingTarget LessonEntity entity, LessonRequest request);
}
