package org.example.elearning.repository;

import org.example.elearning.entity.RefreshTokenEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository  extends JpaRepository<RefreshTokenEntity, Long> {
    Optional<RefreshTokenEntity> findByToken(String token);
    int deleteByExpiryAtBefore(LocalDateTime expiryAtBefore);
    Optional<RefreshTokenEntity> findByJwtId(String jwtId);
}
