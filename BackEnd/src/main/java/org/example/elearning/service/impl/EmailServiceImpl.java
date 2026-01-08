package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.service.EmailService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring6.SpringTemplateEngine;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Override
    public void sendActivationEmail(String toEmail, String userName, String activationLink) {
        log.info("Preparing to send activation email to: {}", toEmail);
        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("activationLink", activationLink);

        String htmlContent = templateEngine.process("email/activation", context);
        sendHtmlEmail(toEmail, "Kích hoạt tài khoản - E-Learning Platform", htmlContent);
    }

    @Override
    public void sendPasswordResetEmail(String toEmail, String userName, String resetLink) {
        log.info("Preparing to send password reset email to: {}", toEmail);
        Context context = new Context();
        context.setVariable("userName", userName);
        context.setVariable("resetLink", resetLink);

        String htmlContent = templateEngine.process("email/reset-password", context);
        sendHtmlEmail(toEmail, "Đặt lại mật khẩu - E-Learning Platform", htmlContent);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Không thể gửi email", e);
        }
    }
}
