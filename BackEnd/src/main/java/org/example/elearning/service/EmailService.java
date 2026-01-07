package org.example.elearning.service;

public interface EmailService {
    
    /**
     * Send account activation email with password reset link
     */
    void sendActivationEmail(String toEmail, String userName, String activationLink);
    
    /**
     * Send password reset email
     */
    void sendPasswordResetEmail(String toEmail, String userName, String resetLink);
}
