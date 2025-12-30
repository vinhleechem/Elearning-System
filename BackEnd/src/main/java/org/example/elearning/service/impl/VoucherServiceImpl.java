package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.response.UserVoucherResponse;
import org.example.elearning.dto.response.VoucherResponse;
import org.example.elearning.entity.*;
import org.example.elearning.enums.VoucherApplicability;
import org.example.elearning.enums.VoucherSource;
import org.example.elearning.enums.VoucherType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.VoucherMapper;
import org.example.elearning.repository.*;
import org.example.elearning.service.VoucherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final VoucherMapper voucherMapper;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request, Long creatorId) {
        log.info("Creating new voucher: {}", request.getCode());

        // Check if code already exists
        if (voucherRepository.findByCodeAndIsDeletedFalse(request.getCode()).isPresent()) {
            throw new ResourceConflictException(ErrorCode.VOUCHER_ALREADY_EXISTS.getMessage());
        }

        // Create voucher entity using mapper
        VoucherEntity voucher = voucherMapper.toEntity(request);
        voucher.setUsedCount(0);
        voucher.setApplicableCourses(new ArrayList<>());

        // Set instructor if provided
        if (request.getInstructorId() != null) {
            InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            voucher.setInstructor(instructor);
        }

        voucher = voucherRepository.save(voucher);

        // Add applicable courses if SPECIFIC_COURSES
        if (request.getApplicableTo() == VoucherApplicability.SPECIFIC_COURSES
                && request.getApplicableCourseIds() != null && !request.getApplicableCourseIds().isEmpty()) {
            List<CourseEntity> courses = courseRepository.findAllById(request.getApplicableCourseIds());
            voucher.getApplicableCourses().addAll(courses);
            voucher = voucherRepository.save(voucher);
        }

        log.info("Voucher created successfully: {}", voucher.getCode());
        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long voucherId, VoucherRequest request) {
        log.info("Updating voucher ID: {}", voucherId);

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        // Update fields using mapper
        voucherMapper.updateEntity(voucher, request);

        // Update applicable courses
        voucher.getApplicableCourses().clear();
        if (request.getApplicableTo() == VoucherApplicability.SPECIFIC_COURSES
                && request.getApplicableCourseIds() != null && !request.getApplicableCourseIds().isEmpty()) {
            List<CourseEntity> courses = courseRepository.findAllById(request.getApplicableCourseIds());
            voucher.getApplicableCourses().addAll(courses);
        }

        voucher = voucherRepository.save(voucher);
        log.info("Voucher updated successfully");

        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long voucherId) {
        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable)
                .map(voucherMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getPublicVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<VoucherEntity> vouchers = voucherRepository.findAvailablePublicVouchers(now);

        return vouchers.stream()
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserVoucherResponse claimVoucher(String code, Long userId) {
        log.info("User {} claiming voucher: {}", userId, code);

        // Find voucher
        VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_CODE_NOT_FOUND.getMessage()));

        // Validate voucher
        validateVoucherForClaim(voucher, userId);

        // Find user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create user voucher
        UserVoucherEntity userVoucher = UserVoucherEntity.builder()
                .user(user)
                .voucher(voucher)
                .source(VoucherSource.SYSTEM_GIFT)
                .isUsed(false)
                .build();

        userVoucher = userVoucherRepository.save(userVoucher);
        log.info("Voucher claimed successfully");

        return mapToUserVoucherResponse(userVoucher);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserVoucherResponse> getUserVouchers(Long userId, Boolean onlyAvailable) {
        List<UserVoucherEntity> userVouchers;

        if (onlyAvailable != null && onlyAvailable) {
            LocalDateTime now = LocalDateTime.now();
            userVouchers = userVoucherRepository.findAvailableVouchers(userId, now);
        } else {
            userVouchers = userVoucherRepository.findByUser_UserIdAndIsDeletedFalse(userId);
        }

        return userVouchers.stream()
                .map(this::mapToUserVoucherResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateVoucherCode(String code, Long userId) {
        try {
            VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(code)
                    .orElse(null);

            if (voucher == null) {
                return false;
            }

            validateVoucherForClaim(voucher, userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void deleteVoucher(Long voucherId) {
        log.info("Deleting voucher ID: {}", voucherId);

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        voucher.setDeleted(true);
        voucherRepository.save(voucher);
        log.info("Voucher soft deleted successfully");
    }

    @Override
    @Transactional
    public void grantVoucherToUsers(Long voucherId, List<Long> userIds) {
        log.info("Granting voucher ID {} to {} users", voucherId, userIds.size());

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        List<UserEntity> users = userRepository.findAllById(userIds);

        for (UserEntity user : users) {
            // Check if user already has this voucher
            if (userVoucherRepository.findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(
                    user.getUserId(), voucherId).isEmpty()) {

                UserVoucherEntity userVoucher = UserVoucherEntity.builder()
                        .user(user)
                        .voucher(voucher)
                        .source(VoucherSource.ADMIN_GRANT)
                        .isUsed(false)
                        .build();

                userVoucherRepository.save(userVoucher);
            }
        }

        log.info("Voucher granted successfully");
    }

    // Validation methods
    private void validateVoucherForClaim(VoucherEntity voucher, Long userId) {
        LocalDateTime now = LocalDateTime.now();

        // Check if active
        if (!voucher.getIsActive()) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_ACTIVE.getMessage());
        }

        // Check dates
        if (now.isBefore(voucher.getStartDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_STARTED.getMessage());
        }

        if (now.isAfter(voucher.getEndDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_EXPIRED.getMessage());
        }

        // Check total usage limit
        if (voucher.getTotalUsageLimit() != null && voucher.getUsedCount() >= voucher.getTotalUsageLimit()) {
            throw new BusinessException(ErrorCode.VOUCHER_TOTAL_LIMIT_REACHED.getMessage());
        }

        // Check if user already has this voucher
        if (!userVoucherRepository.findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(
                userId, voucher.getVoucherId()).isEmpty()) {
            throw new BusinessException(ErrorCode.VOUCHER_ALREADY_OWNED.getMessage());
        }

        // Check per-user usage limit
        long userUsageCount = userVoucherRepository.countUsedVouchers(userId, voucher.getVoucherId());
        if (voucher.getPerUserLimit() != null && userUsageCount >= voucher.getPerUserLimit()) {
            throw new BusinessException(ErrorCode.VOUCHER_USER_LIMIT_REACHED.getMessage());
        }
    }

    private UserVoucherResponse mapToUserVoucherResponse(UserVoucherEntity userVoucher) {
        VoucherEntity voucher = userVoucher.getVoucher();
        LocalDateTime now = LocalDateTime.now();

        String status;
        if (userVoucher.getIsUsed()) {
            status = "USED";
        } else if (now.isAfter(voucher.getEndDate())) {
            status = "EXPIRED";
        } else {
            status = "AVAILABLE";
        }

        return UserVoucherResponse.builder()
                .userVoucherId(userVoucher.getUserVoucherId())
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .source(userVoucher.getSource())
                .receivedAt(userVoucher.getReceivedAt())
                .isUsed(userVoucher.getIsUsed())
                .usedAt(userVoucher.getUsedAt())
                .orderId(userVoucher.getOrder() != null ? userVoucher.getOrder().getOrderId() : null)
                .expiryDate(voucher.getEndDate())
                .status(status)
                .build();
    }
}
