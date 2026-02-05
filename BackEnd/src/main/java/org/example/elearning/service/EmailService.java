package org.example.elearning.service;

public interface EmailService {
    void sendActivationEmail(String toEmail, String userName, String activationLink);
    
    void sendPasswordResetEmail(String toEmail, String userName, String resetLink);
}
