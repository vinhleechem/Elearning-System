package org.example.elearning.mapper;

import org.example.elearning.dto.request.SectionRequest;
import org.example.elearning.dto.response.SectionResponse;
import org.example.elearning.entity.SectionEntity;
import org.mapstruct.*;

import java.util.List;

@Mapper(componentModel = "spring")
public interface SectionMapper {

    @Mapping(target = "courseId", source = "course.courseId")
    SectionResponse toResponse(SectionEntity entity);

    List<SectionResponse> toResponseList(List<SectionEntity> entities);

    @Mapping(target = "sectionId", ignore = true)
    @Mapping(target = "course", ignore = true)
    SectionEntity toEntity(SectionRequest request);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "sectionId", ignore = true)
    @Mapping(target = "course", ignore = true)
    void updateEntity(@MappingTarget SectionEntity entity, SectionRequest request);
}
