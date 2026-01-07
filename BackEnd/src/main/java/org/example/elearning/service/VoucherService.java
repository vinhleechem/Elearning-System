package org.example.elearning.service;

import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.response.UserVoucherResponse;
import org.example.elearning.dto.response.VoucherResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VoucherService {

    /**
     * Create new voucher (Admin/Instructor)
     */
    VoucherResponse createVoucher(VoucherRequest request, Long creatorId);

    /**
     * Update voucher
     */
    VoucherResponse updateVoucher(Long voucherId, VoucherRequest request);

    /**
     * Get voucher by ID
     */
    VoucherResponse getVoucherById(Long voucherId);

    /**
     * Get all vouchers with pagination
     */
    Page<VoucherResponse> getAllVouchers(Pageable pageable);

    /**
     * Get public vouchers (available for all users)
     */
    List<VoucherResponse> getPublicVouchers();

    /**
     * Claim voucher by code
     */
    UserVoucherResponse claimVoucher(String code, Long userId);

    /**
     * Get user's vouchers
     */
    List<UserVoucherResponse> getUserVouchers(Long userId, Boolean onlyAvailable);

    /**
     * Validate voucher code
     */
    boolean validateVoucherCode(String code, Long userId);

    /**
     * Delete voucher
     */
    void deleteVoucher(Long voucherId);

    /**
     * Grant voucher to specific users (Admin)
     */
    void grantVoucherToUsers(Long voucherId, List<Long> userIds);

    void importVouchers(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;

    byte[] exportVouchers() throws java.io.IOException;
}
