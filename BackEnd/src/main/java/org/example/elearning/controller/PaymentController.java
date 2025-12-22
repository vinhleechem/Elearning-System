package org.example.elearning.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.example.elearning.dto.request.PaymentRequest;
import org.example.elearning.dto.response.PaymentResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.PaymentService;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/payment")
@RequiredArgsConstructor
public class PaymentController {
    private final PaymentService paymentService;

    @PostMapping("/create_payment")
    public StandardResponse<PaymentResponse> createPayment(@RequestBody PaymentRequest request,
            HttpServletRequest httpServletRequest) {
        return StandardResponse.success(paymentService.createVnPayPayment(request, httpServletRequest));
    }

    @GetMapping("/vn-pay-callback")
    public void convertPayment(HttpServletRequest request, HttpServletResponse response) throws IOException {
        PaymentResponse paymentResponse = paymentService.handlerVNPayCallback(request);
        response.sendRedirect(paymentResponse.getRedirectUrl());
    }
}
