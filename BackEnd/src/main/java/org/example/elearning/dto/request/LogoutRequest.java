package org.example.elearning.dto.request;

import lombok.Getter;

@Getter
public class LogoutRequest {
    String accessToken;
    String refreshToken;
}
