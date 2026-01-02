package org.example.elearning.service;

import org.example.elearning.dto.request.CommissionRateRequest;
import org.example.elearning.dto.request.InstructorPayoutRequest;
import org.example.elearning.dto.response.CommissionRateResponse;
import org.example.elearning.dto.response.InstructorPayoutResponse;
import org.example.elearning.enums.PayoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;

public interface CommissionService {
    
    // Commission Rate Management
    CommissionRateResponse createCommissionRate(CommissionRateRequest request);
    
    CommissionRateResponse updateCommissionRate(Long rateId, CommissionRateRequest request);
    
    CommissionRateResponse getCommissionRate(Long rateId);
    
    CommissionRateResponse getActiveCommissionRateByInstructor(Long instructorId);
    
    void deactivateCommissionRate(Long rateId);
    
    // Instructor Payout Management
    InstructorPayoutResponse createPayout(InstructorPayoutRequest request);
    
    InstructorPayoutResponse getPayout(Long payoutId);
    
    List<InstructorPayoutResponse> getPayoutsByInstructor(Long instructorId);
    
    Page<InstructorPayoutResponse> getPayoutsByInstructor(Long instructorId, Pageable pageable);
    
    List<InstructorPayoutResponse> getPayoutsByStatus(PayoutStatus status);
    
    Page<InstructorPayoutResponse> getAllPayouts(Pageable pageable);
    
    InstructorPayoutResponse updatePayoutStatus(Long payoutId, PayoutStatus status, String transactionId);
    
    InstructorPayoutResponse completePayout(Long payoutId, String transactionId);
    
    // Generate payout for instructor based on period
    InstructorPayoutResponse generatePayoutForPeriod(Long instructorId, LocalDateTime periodStart, LocalDateTime periodEnd);
}
