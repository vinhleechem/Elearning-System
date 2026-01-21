package org.example.elearning.mapper;

import org.example.elearning.dto.response.MessageResponse;
import org.example.elearning.entity.MessageEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

import java.util.List;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface MessageMapper {
    @Mapping(target = "conversationId", source = "conversation.conversationId")
    @Mapping(target = "senderId", source = "sender.userId")
    @Mapping(target = "senderName", source = "sender.fullName")
    @Mapping(target = "senderAvatar", source = "sender.avatarUrl")
    MessageResponse toResponse(MessageEntity messageEntity);

    MessageEntity toEntity(MessageResponse messageResponse);

    List<MessageResponse> toResponseList(List<MessageEntity> messageEntities);

}
