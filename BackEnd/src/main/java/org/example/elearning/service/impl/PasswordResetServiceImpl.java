package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.SetPasswordRequest;
import org.example.elearning.entity.PasswordResetTokenEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BadRequestException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.PasswordResetTokenRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.EmailService;
import org.example.elearning.service.PasswordResetService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.example.elearning.exception.ErrorCode.INVALID_CONFIRM_PASSWORD;

@Service
@RequiredArgsConstructor
@Slf4j
public class PasswordResetServiceImpl implements PasswordResetService {

    private final PasswordResetTokenRepository tokenRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Override
    @Transactional
    public void createActivationToken(Long userId) {
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Delete old tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate unique token
        String token = UUID.randomUUID().toString();

        // Create token entity (expires in 24 hours)
        PasswordResetTokenEntity tokenEntity = PasswordResetTokenEntity.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .isUsed(false)
                .tokenType(PasswordResetTokenEntity.TokenType.ACCOUNT_ACTIVATION)
                .build();

        tokenRepository.save(tokenEntity);

        // Send activation email
        String activationLink = frontendUrl + "/set-password?token=" + token;
        emailService.sendActivationEmail(user.getEmail(), user.getFullName(), activationLink);

        log.info("Activation token created for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void createPasswordResetToken(String email) {
        UserEntity user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Email không tồn tại trong hệ thống"));

        // Delete old tokens for this user
        tokenRepository.deleteByUser(user);

        // Generate unique token
        String token = UUID.randomUUID().toString();

        // Create token entity (expires in 1 hour)
        PasswordResetTokenEntity tokenEntity = PasswordResetTokenEntity.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(1))
                .isUsed(false)
                .tokenType(PasswordResetTokenEntity.TokenType.PASSWORD_RESET)
                .build();

        tokenRepository.save(tokenEntity);

        // Send password reset email
        String resetLink = frontendUrl + "/set-password?token=" + token;
        emailService.sendPasswordResetEmail(user.getEmail(), user.getFullName(), resetLink);

        log.info("Password reset token created for user: {}", user.getEmail());
    }

    @Override
    @Transactional
    public void setPassword(SetPasswordRequest request) {
        // Validate passwords match
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException(ErrorCode.INVALID_CONFIRM_PASSWORD.getMessage());
        }

        // Find token
        PasswordResetTokenEntity tokenEntity = tokenRepository.findByTokenAndIsUsedFalse(request.getToken())
                .orElseThrow(() -> new BadRequestException(ErrorCode.PASSWORD_RESET_TOKEN_USED.getMessage()));

        // Check if expired
        if (tokenEntity.isExpired()) {
            throw new BadRequestException(ErrorCode.PASSWORD_RESET_TOKEN_EXPIRED.getMessage());
        }

        // Update user password
        UserEntity user = tokenEntity.getUser();
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        userRepository.save(user);

        // Mark token as used
        tokenEntity.setIsUsed(true);
        tokenRepository.save(tokenEntity);

        log.info("Password set successfully for user: {}", user.getEmail());
    }

    @Override
    public boolean validateToken(String token) {
        return tokenRepository.findByTokenAndIsUsedFalse(token)
                .map(tokenEntity -> !tokenEntity.isExpired())
                .orElse(false);
    }
}
