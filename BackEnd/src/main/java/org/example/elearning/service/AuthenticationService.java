package org.example.elearning.service;

import org.example.elearning.dto.request.*;
import org.example.elearning.dto.response.IntrospectResponse;
import org.example.elearning.dto.response.RefreshTokenResponse;
import org.example.elearning.dto.response.UserResponse;
import org.springframework.stereotype.Service;

import java.text.ParseException;

@Service

public interface AuthenticationService {
    IntrospectResponse introspect(IntrospectRequest introspectRequest);

    UserResponse.UserLoginResponse login(UserLoginRequest accountLoginRequest);

    UserResponse register(RegisterRequest registerRequest);

    void logout(LogoutRequest logoutRequest);

    RefreshTokenResponse refreshToken(RefreshTokenRequest request);

    UserResponse.UserLoginResponse outboundAuthentication(String code);

    UserResponse.UserLoginResponse outboundFacebookAuthentication(String code);
}