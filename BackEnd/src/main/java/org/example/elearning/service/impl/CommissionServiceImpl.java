package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.CommissionRateRequest;
import org.example.elearning.dto.request.InstructorPayoutRequest;
import org.example.elearning.dto.response.CommissionRateResponse;
import org.example.elearning.dto.response.InstructorPayoutResponse;
import org.example.elearning.entity.CommissionRateEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.InstructorPayoutEntity;
import org.example.elearning.enums.PayoutStatus;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.CommissionRateRepository;
import org.example.elearning.repository.InstructorPayoutRepository;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.service.CommissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class CommissionServiceImpl implements CommissionService {

    CommissionRateRepository commissionRateRepository;
    InstructorPayoutRepository payoutRepository;
    InstructorRepository instructorRepository;
    OrderRepository orderRepository;
    
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("70.00"); // 70% for instructor

    @Override
    @Transactional
    public CommissionRateResponse createCommissionRate(CommissionRateRequest request) {
        InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        
        // Deactivate existing active rate if any
        commissionRateRepository.findByInstructorAndIsActiveTrue(instructor)
                .ifPresent(existingRate -> {
                    existingRate.setIsActive(false);
                    commissionRateRepository.save(existingRate);
                });
        
        CommissionRateEntity entity = CommissionRateEntity.builder()
                .instructor(instructor)
                .ratePercentage(request.getRatePercentage())
                .minPayoutAmount(request.getMinPayoutAmount() != null ? request.getMinPayoutAmount() : BigDecimal.ZERO)
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .notes(request.getNotes())
                .build();
        
        CommissionRateEntity saved = commissionRateRepository.save(entity);
        return mapToCommissionRateResponse(saved);
    }

    @Override
    @Transactional
    public CommissionRateResponse updateCommissionRate(Long rateId, CommissionRateRequest request) {
        CommissionRateEntity entity = commissionRateRepository.findById(rateId)
                .orElseThrow(() -> new ResourceNotFoundException("Commission rate not found"));
        
        entity.setRatePercentage(request.getRatePercentage());
        entity.setMinPayoutAmount(request.getMinPayoutAmount());
        entity.setIsActive(request.getIsActive() != null ? request.getIsActive() : entity.getIsActive());
        entity.setNotes(request.getNotes());
        
        CommissionRateEntity saved = commissionRateRepository.save(entity);
        return mapToCommissionRateResponse(saved);
    }

    @Override
    public CommissionRateResponse getCommissionRate(Long rateId) {
        CommissionRateEntity entity = commissionRateRepository.findById(rateId)
                .orElseThrow(() -> new ResourceNotFoundException("Commission rate not found"));
        return mapToCommissionRateResponse(entity);
    }

    @Override
    public CommissionRateResponse getActiveCommissionRateByInstructor(Long instructorId) {
        CommissionRateEntity entity = commissionRateRepository.findByInstructor_InstructorIdAndIsActiveTrue(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Active commission rate not found for instructor"));
        return mapToCommissionRateResponse(entity);
    }

    @Override
    @Transactional
    public void deactivateCommissionRate(Long rateId) {
        CommissionRateEntity entity = commissionRateRepository.findById(rateId)
                .orElseThrow(() -> new ResourceNotFoundException("Commission rate not found"));
        entity.setIsActive(false);
        commissionRateRepository.save(entity);
    }

    @Override
    @Transactional
    public InstructorPayoutResponse createPayout(InstructorPayoutRequest request) {
        InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        
        // Get commission rate
        BigDecimal rate = commissionRateRepository.findByInstructorAndIsActiveTrue(instructor)
                .map(CommissionRateEntity::getRatePercentage)
                .orElse(DEFAULT_COMMISSION_RATE);
        
        // Calculate commission amounts
        BigDecimal amount = request.getAmount();
        BigDecimal instructorRate = rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal netAmount = amount.multiply(instructorRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal commissionAmount = amount.subtract(netAmount);
        
        InstructorPayoutEntity entity = InstructorPayoutEntity.builder()
                .instructor(instructor)
                .amount(amount)
                .commissionAmount(commissionAmount)
                .netAmount(netAmount)
                .periodStart(request.getPeriodStart())
                .periodEnd(request.getPeriodEnd())
                .status(PayoutStatus.PENDING)
                .paymentMethod(request.getPaymentMethod())
                .transactionId(request.getTransactionId())
                .notes(request.getNotes())
                .build();
        
        InstructorPayoutEntity saved = payoutRepository.save(entity);
        return mapToPayoutResponse(saved);
    }

    @Override
    public InstructorPayoutResponse getPayout(Long payoutId) {
        InstructorPayoutEntity entity = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));
        return mapToPayoutResponse(entity);
    }

    @Override
    public List<InstructorPayoutResponse> getPayoutsByInstructor(Long instructorId) {
        return payoutRepository.findByInstructor_InstructorId(instructorId).stream()
                .map(this::mapToPayoutResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<InstructorPayoutResponse> getPayoutsByInstructor(Long instructorId, Pageable pageable) {
        return payoutRepository.findByInstructor_InstructorId(instructorId, pageable)
                .map(this::mapToPayoutResponse);
    }

    @Override
    public List<InstructorPayoutResponse> getPayoutsByStatus(PayoutStatus status) {
        return payoutRepository.findByStatus(status).stream()
                .map(this::mapToPayoutResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<InstructorPayoutResponse> getAllPayouts(Pageable pageable) {
        return payoutRepository.findAll(pageable)
                .map(this::mapToPayoutResponse);
    }

    @Override
    @Transactional
    public InstructorPayoutResponse updatePayoutStatus(Long payoutId, PayoutStatus status, String transactionId) {
        InstructorPayoutEntity entity = payoutRepository.findById(payoutId)
                .orElseThrow(() -> new ResourceNotFoundException("Payout not found"));
        
        entity.setStatus(status);
        if (transactionId != null) {
            entity.setTransactionId(transactionId);
        }
        
        if (status == PayoutStatus.COMPLETED && entity.getPaidAt() == null) {
            entity.setPaidAt(LocalDateTime.now());
        }
        
        InstructorPayoutEntity saved = payoutRepository.save(entity);
        return mapToPayoutResponse(saved);
    }

    @Override
    @Transactional
    public InstructorPayoutResponse completePayout(Long payoutId, String transactionId) {
        return updatePayoutStatus(payoutId, PayoutStatus.COMPLETED, transactionId);
    }

    @Override
    @Transactional
    public InstructorPayoutResponse generatePayoutForPeriod(Long instructorId, LocalDateTime periodStart, LocalDateTime periodEnd) {
        InstructorEntity instructor = instructorRepository.findById(instructorId)
                .orElseThrow(() -> new ResourceNotFoundException("Instructor not found"));
        
        // Calculate revenue for the period
        LocalDate startDate = periodStart.toLocalDate();
        LocalDate endDate = periodEnd.toLocalDate();
        
        List<Object[]> results = orderRepository.getRevenueByInstructorNative(startDate, endDate);
        
        BigDecimal totalRevenue = BigDecimal.ZERO;
        for (Object[] result : results) {
            Long instructorIdFromQuery = ((Number) result[0]).longValue();
            if (instructorIdFromQuery.equals(instructorId)) {
                totalRevenue = (BigDecimal) result[2];
                break;
            }
        }
        
        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) {
            throw new IllegalStateException("No revenue found for this period");
        }
        
        // Get commission rate
        BigDecimal rate = commissionRateRepository.findByInstructorAndIsActiveTrue(instructor)
                .map(CommissionRateEntity::getRatePercentage)
                .orElse(DEFAULT_COMMISSION_RATE);
        
        BigDecimal instructorRate = rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
        BigDecimal netAmount = totalRevenue.multiply(instructorRate).setScale(2, RoundingMode.HALF_UP);
        BigDecimal commissionAmount = totalRevenue.subtract(netAmount);
        
        InstructorPayoutEntity entity = InstructorPayoutEntity.builder()
                .instructor(instructor)
                .amount(totalRevenue)
                .commissionAmount(commissionAmount)
                .netAmount(netAmount)
                .periodStart(periodStart)
                .periodEnd(periodEnd)
                .status(PayoutStatus.PENDING)
                .notes("Auto-generated payout for period " + startDate + " to " + endDate)
                .build();
        
        InstructorPayoutEntity saved = payoutRepository.save(entity);
        return mapToPayoutResponse(saved);
    }

    private CommissionRateResponse mapToCommissionRateResponse(CommissionRateEntity entity) {
        return CommissionRateResponse.builder()
                .rateId(entity.getRateId())
                .instructorId(entity.getInstructor().getInstructorId())
                .instructorName(entity.getInstructor().getUser().getFullName())
                .ratePercentage(entity.getRatePercentage())
                .minPayoutAmount(entity.getMinPayoutAmount())
                .isActive(entity.getIsActive())
                .notes(entity.getNotes())
                .build();
    }

    private InstructorPayoutResponse mapToPayoutResponse(InstructorPayoutEntity entity) {
        return InstructorPayoutResponse.builder()
                .payoutId(entity.getPayoutId())
                .instructorId(entity.getInstructor().getInstructorId())
                .instructorName(entity.getInstructor().getUser().getFullName())
                .amount(entity.getAmount())
                .commissionAmount(entity.getCommissionAmount())
                .netAmount(entity.getNetAmount())
                .periodStart(entity.getPeriodStart())
                .periodEnd(entity.getPeriodEnd())
                .status(entity.getStatus())
                .paymentMethod(entity.getPaymentMethod())
                .transactionId(entity.getTransactionId())
                .paidAt(entity.getPaidAt())
                .createdAt(entity.getCreatedAt())
                .notes(entity.getNotes())
                .build();
    }
}
