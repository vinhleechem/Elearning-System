package org.example.elearning.service.impl;

import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.response.RefreshTokenResponse;
import org.example.elearning.entity.RefreshTokenEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.UnauthorizedException;
import org.example.elearning.repository.RefreshTokenRepository;
import org.example.elearning.service.JwtService;
import org.example.elearning.service.RefreshTokenService;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class RefreshTokenServiceImpl implements RefreshTokenService {

    RefreshTokenRepository refreshTokenRepository;
    JwtService jwtService;

    @Override
    public RefreshTokenEntity createRefreshToken(UserEntity user) {
        String refreshTokenJwt = jwtService.generateRefreshToken(user);

        Claims claims = jwtService.verifyToken(refreshTokenJwt, true);
        String jti = claims.getId();
        Date expiry = claims.getExpiration();

        RefreshTokenEntity refreshToken = RefreshTokenEntity.builder()
                .jwtId(jti)
                .token(refreshTokenJwt)
                .expiryAt(expiry.toInstant().atZone(ZoneId.systemDefault()).toLocalDateTime())
                .user(user)
                .build();

        return refreshTokenRepository.save(refreshToken);
    }

    @Override
    public RefreshTokenEntity  findByToken(String token) {
        return refreshTokenRepository.findByToken(token).orElseThrow(() ->
                new UnauthorizedException("Refresh token not found or invalid"));
    }

    @Override
    public RefreshTokenEntity verifyExpiration(RefreshTokenEntity token) {
        if (token.getExpiryAt().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(token);
            throw new UnauthorizedException(ErrorCode.INVALID_TOKEN.getMessage());
        }
        return token;
    }

    @Override
    public RefreshTokenResponse refreshToken(String requestRefreshToken) {
        try {
            Claims claims = jwtService.verifyToken(requestRefreshToken, true);
            String jti = claims.getId();

            return refreshTokenRepository.findByJwtId(jti)
                    .map(this::verifyExpiration)
                    .map(RefreshTokenEntity::getUser)
                    .map(user -> {
                        String newAccessToken = jwtService.generateAccessToken(user);
                        return new RefreshTokenResponse(newAccessToken);
                    })
                    .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_TOKEN.getMessage()));
        } catch (Exception e) {
            throw new UnauthorizedException(ErrorCode.INVALID_TOKEN.getMessage());
        }
    }

    @Scheduled(fixedRate = 3600000)
    @Transactional
    public void cleanExpiredTokens() {
        LocalDateTime now = LocalDateTime.now();
        int deletedCount = refreshTokenRepository.deleteByExpiryAtBefore(now);
        if (deletedCount > 0) {
            log.info("🧹 Deleted {} expired refresh tokens before {}", deletedCount, now);
        }
    }
}
