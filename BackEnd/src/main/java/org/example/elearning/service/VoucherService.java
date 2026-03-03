package org.example.elearning.service;

import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.request.VoucherValidationRequest;
import org.example.elearning.dto.response.UserVoucherResponse;
import org.example.elearning.dto.response.VoucherResponse;
import org.example.elearning.dto.response.VoucherValidationResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface VoucherService {

    VoucherResponse createVoucher(VoucherRequest request, Long creatorId);

    VoucherResponse updateVoucher(Long voucherId, VoucherRequest request);

    VoucherResponse getVoucherById(Long voucherId);

    Page<VoucherResponse> getAllVouchers(Pageable pageable);

    List<VoucherResponse> getPublicVouchers();

    UserVoucherResponse claimVoucher(String code, Long userId);

    List<UserVoucherResponse> getUserVouchers(Long userId, Boolean onlyAvailable);

    boolean validateVoucherCode(String code, Long userId);


    void deleteVoucher(Long voucherId);

    void grantVoucherToUsers(Long voucherId, List<Long> userIds);

    void importVouchers(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;

    byte[] exportVouchers() throws java.io.IOException;

    VoucherValidationResponse validateVoucher(
            String voucherCode,
            Long userId,
            List<VoucherValidationRequest.CartItem> cartItems
    );

    List<VoucherResponse> getAvailableVouchersForBooking(Long userId);
}
