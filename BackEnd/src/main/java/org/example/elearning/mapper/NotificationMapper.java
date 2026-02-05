package org.example.elearning.mapper;

import org.example.elearning.dto.request.NotificationRequest;
import org.example.elearning.dto.response.NotificationResponse;
import org.example.elearning.entity.NotificationEntity;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.Named;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring")
public interface NotificationMapper {

    @Mapping(target = "userId", source = "user.userId")
    @Mapping(target = "userName", source = "user.fullName")
    NotificationResponse toResponse(NotificationEntity entity);

    @Mapping(target = "type", qualifiedByName = "stringToNotificationType")
    NotificationResponse toResponse(NotificationRequest request);

    @Named("stringToNotificationType")
    default org.example.elearning.enums.NotificationType stringToNotificationType(String type) {
        return org.example.elearning.enums.NotificationType.valueOf(type);
    }
}
