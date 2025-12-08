package org.example.elearning.dto.response;

import java.util.List;

import org.example.elearning.enums.Provider;

import com.fasterxml.jackson.annotation.JsonInclude;

import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse{
    Long userId;
    String email;
    String fullName;
    String avatarUrl;
    String providerId;
    Provider provider = Provider.LOCAL;
    List<String> roles;

    // Thông tin giảng viên (chỉ set khi user là INSTRUCTOR)
    Long instructorId;
    String instructorHeadline;
    String instructorBiography;
    String instructorWebsite;
    String instructorLinkedin;
    String instructorTwitter;
    String instructorYoutube;
    Integer instructorTotalStudents;
    Integer instructorTotalCourses;

    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @Builder
    public static class UserLoginResponse{
        String accessToken;
        String refreshToken;
    }
}
