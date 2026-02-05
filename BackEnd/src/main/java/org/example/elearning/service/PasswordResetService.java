package org.example.elearning.service;

import org.example.elearning.dto.request.SetPasswordRequest;

public interface PasswordResetService {
    void createActivationToken(Long userId);
    
    void createPasswordResetToken(String email);

    void setPassword(SetPasswordRequest request);
    
    boolean validateToken(String token);
}
