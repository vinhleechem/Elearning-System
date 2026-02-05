package org.example.elearning.repository;

import org.example.elearning.entity.PasswordResetTokenEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetTokenEntity, Long> {
    
    Optional<PasswordResetTokenEntity> findByTokenAndIsUsedFalse(String token);
    
    void deleteByUser(UserEntity user);
    
}
