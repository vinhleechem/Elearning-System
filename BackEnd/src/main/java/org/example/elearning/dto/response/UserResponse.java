package org.example.elearning.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.Provider;
import org.hibernate.annotations.Nationalized;

import java.util.Set;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponse extends ResponseAbstract{
    Long userId;
    String email;
    String fullName;
    String avatarUrl;
    String providerId;
    Provider provider = Provider.LOCAL;

    @Getter
    @Setter
    @FieldDefaults(level = AccessLevel.PRIVATE)
    @Builder
    public static class UserLoginResponse{
        String accessToken;
        String refreshToken;
    }
}
