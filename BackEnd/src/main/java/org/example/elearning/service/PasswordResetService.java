package org.example.elearning.service;

import org.example.elearning.dto.request.SetPasswordRequest;

public interface PasswordResetService {
    
    /**
     * Create activation token and send email when admin creates new user
     */
    void createActivationToken(Long userId);
    
    /**
     * Create password reset token and send email
     */
    void createPasswordResetToken(String email);
    
    /**
     * Validate token and set new password
     */
    void setPassword(SetPasswordRequest request);
    
    /**
     * Validate if token is valid and not expired
     */
    boolean validateToken(String token);
}
