package org.example.elearning.service;

import org.example.elearning.dto.response.RefreshTokenResponse;
import org.example.elearning.entity.RefreshTokenEntity;
import org.example.elearning.entity.UserEntity;


public interface RefreshTokenService {
    RefreshTokenEntity createRefreshToken(UserEntity user);

    RefreshTokenEntity findByToken(String token);

    RefreshTokenEntity verifyExpiration(RefreshTokenEntity token);

    RefreshTokenResponse refreshToken(String requestRefreshToken);

}
