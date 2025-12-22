package org.example.elearning.service;

import jakarta.servlet.http.HttpServletRequest;
import org.example.elearning.dto.request.PaymentRequest;
import org.example.elearning.dto.response.PaymentResponse;

public interface PaymentService {
    PaymentResponse createVnPayPayment(PaymentRequest paymentRequest, HttpServletRequest httpServletRequest);

    PaymentResponse handlerVNPayCallback(HttpServletRequest httpServletRequest);
}
