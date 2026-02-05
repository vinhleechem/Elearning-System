package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PasswordResetTokenEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long tokenId;
    
    @Column(nullable = false, unique = true)
    String token;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;
    
    @Column(nullable = false)
    LocalDateTime expiryDate;
    
    @Column(nullable = false)
    Boolean isUsed = false;
    
    @Column(nullable = false, updatable = false)
    LocalDateTime createdAt;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    TokenType tokenType = TokenType.PASSWORD_RESET;
    
    public enum TokenType {
        PASSWORD_RESET,
        ACCOUNT_ACTIVATION
    }
    
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiryDate);
    }

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (isUsed == null) {
            isUsed = false;
        }
        if (tokenType == null) {
            tokenType = TokenType.PASSWORD_RESET;
        }
    }
}
