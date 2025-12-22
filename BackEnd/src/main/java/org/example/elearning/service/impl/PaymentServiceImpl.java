package org.example.elearning.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.config.VNPayConfig;
import org.example.elearning.dto.request.PaymentRequest;
import org.example.elearning.dto.response.PaymentResponse;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.PaymentEntity;
import org.example.elearning.enums.OrderStatus;
import org.example.elearning.enums.PaymentStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.entity.OrderItemEntity;
import org.example.elearning.repository.OrderItemRepository;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.repository.PaymentRepository;
import org.example.elearning.service.EnrollmentService;
import org.example.elearning.service.PaymentService;
import org.example.elearning.util.VNPayUtil;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class PaymentServiceImpl implements PaymentService {
    VNPayConfig vnPayConfig;
    OrderRepository orderRepository;
    PaymentRepository paymentRepository;

    EnrollmentService enrollmentService; // Use Service instead of Repository
    OrderItemRepository orderItemRepository;

    @Override
    public PaymentResponse createVnPayPayment(PaymentRequest paymentRequest, HttpServletRequest httpServletRequest) {
        OrderEntity order = orderRepository.findById(paymentRequest.getOrderId()).orElseThrow(
                () -> new ResourceNotFoundException(ErrorCode.ORDER_NOT_FOUND.getMessage()));

        long amount = order.getFinalAmount().multiply(BigDecimal.valueOf(100)).longValue();
        String bankCode = paymentRequest.getBankCode();

        String vnp_TxnRef = VNPayUtil.getRandomNumber(8);

        Map<String, String> vnPayParams = vnPayConfig.getVNPayConfig();
        vnPayParams.put("vnp_TxnRef", vnp_TxnRef);
        vnPayParams.put("vnp_Amount", String.valueOf(amount));

        if (bankCode != null && !bankCode.isEmpty()) {
            vnPayParams.put("vnp_BankCode", bankCode);
        }

        vnPayParams.put("vnp_IpAddr", VNPayUtil.getIpAddress(httpServletRequest));

        String queryUrl = VNPayUtil.getPaymentURL(vnPayParams, true);
        String hashData = VNPayUtil.getPaymentURL(vnPayParams, false);
        String vnpSecureHash = VNPayUtil.hmacSHA512(vnPayConfig.getSecretKey(), hashData);
        queryUrl += "&vnp_SecureHash=" + vnpSecureHash;
        String paymentUrl = vnPayConfig.getVnp_PayUrl() + "?" + queryUrl;

        PaymentEntity payment = PaymentEntity.builder()
                .order(order)
                .amount(order.getFinalAmount())
                .method("VNPAY")
                .status(PaymentStatus.PENDING)
                .transactionRef(vnp_TxnRef)
                .build();

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .code("00")
                .message("Payment URL created successfully")
                .paymentUrl(paymentUrl)
                .build();
    }

    @Override
    public PaymentResponse handlerVNPayCallback(HttpServletRequest httpServletRequest) {
        String vnp_ResponseCode = httpServletRequest.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = httpServletRequest.getParameter("vnp_TxnRef");

        PaymentEntity payment = paymentRepository.findByTransactionRef(vnp_TxnRef).orElseThrow(
                () -> new ResourceNotFoundException(ErrorCode.PAYMENT_NOT_FOUND.getMessage()));

        String baseUrl = "http://localhost:5173";
        String redirectUrl = "";

        if ("00".equals(vnp_ResponseCode)) {
            payment.setStatus(PaymentStatus.SUCCESS);

            OrderEntity order = payment.getOrder();
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            // --- AUTO ENROLL LOGIC (via Service) ---
            List<OrderItemEntity> orderItems = orderItemRepository.findByOrder(order);

            for (OrderItemEntity item : orderItems) {
                // Delegate all enrollment logic to the service
                enrollmentService.createEnrollment(order.getUser(), item.getCourse());
            }
            // --------------------------------------

            redirectUrl = baseUrl + "/payment/success?orderId=" + order.getOrderId();
        } else {
            payment.setStatus(PaymentStatus.FAILED);

            redirectUrl = baseUrl + "/payment/failed?orderId=" + payment.getOrder().getOrderId();
        }

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .code(vnp_ResponseCode)
                .message("00".equals(vnp_ResponseCode) ? "Payment Success" : "Payment Failed")
                .redirectUrl(redirectUrl)
                .build();
    }
}