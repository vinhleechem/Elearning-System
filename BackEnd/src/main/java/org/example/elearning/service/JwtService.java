package org.example.elearning.service;

import io.jsonwebtoken.Claims;
import org.example.elearning.entity.UserEntity;
import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {
    String extractEmail(String token);
    String generateAccessToken(UserEntity user);
    String generateRefreshToken(UserDetails user);
    Claims verifyToken(String token, boolean isRefresh);
    boolean isValidToken(String token);
}
