package org.example.elearning.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.response.ErrorResponse;
import org.example.elearning.exception.ErrorCode;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;


import java.io.IOException;
import java.util.Date;
/*
    → Dùng cho 401 Unauthorized (người dùng chưa đăng nhập hoặc token không hợp lệ).
    → Ví dụ: request không có token, token expired → nhảy vào đây.
*/
@Slf4j(topic = "AUTHENTICATION-ENTRY-POINT")
public class JwtAuthenticationEntryPoint implements AuthenticationEntryPoint {

    @Override
    public void commence(HttpServletRequest request, HttpServletResponse response, AuthenticationException authException) throws IOException {
        log.error("Authentication failed");
        response.setCharacterEncoding("UTF-8");
        response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        ErrorCode errorCode = ErrorCode.UNAUTHENTICATED;
        ErrorResponse errorResponse = ErrorResponse.builder()
                .timestamp(new Date())
                .status(errorCode.getCode())
                .error(errorCode.getMessage())
                .path(request.getRequestURI())
                .build();

        ObjectMapper objectMapper = new ObjectMapper();

        response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
        response.flushBuffer();
    }
}