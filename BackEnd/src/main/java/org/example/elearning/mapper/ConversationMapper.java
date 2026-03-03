package org.example.elearning.mapper;

import org.example.elearning.dto.request.ConversationRequest;
import org.example.elearning.dto.response.ConversationResponse;
import org.example.elearning.entity.ConversationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ConversationMapper {
    @Mapping(target = "courseId", source = "course.courseId")
    @Mapping(target = "courseName", source = "course.title")
    @Mapping(target = "studentId", source = "student.userId")
    @Mapping(target = "studentName", source = "student.fullName")
    @Mapping(target = "studentAvatar", source = "student.avatarUrl")
    @Mapping(target = "instructorId", source = "instructor.instructorId")
    @Mapping(target = "instructorUserId", source = "instructor.user.userId")
    @Mapping(target = "instructorName", source = "instructor.user.fullName")
    @Mapping(target = "instructorAvatar", source = "instructor.user.avatarUrl")
    ConversationResponse toResponse(ConversationEntity conversationEntity);

    ConversationEntity toEntity(ConversationRequest conversationResponse);

}
