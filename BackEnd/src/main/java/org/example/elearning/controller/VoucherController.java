package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.elearning.dto.request.ApplyDiscountRequest;
import org.example.elearning.dto.request.ClaimVoucherRequest;
import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.response.DiscountCalculationResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.dto.response.UserVoucherResponse;
import org.example.elearning.dto.response.VoucherResponse;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.service.DiscountCalculationService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.VoucherService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vouchers")
@RequiredArgsConstructor
@Tag(name = "Voucher Management", description = "APIs for managing vouchers and user vouchers")
public class VoucherController {

    private final VoucherService voucherService;
    private final DiscountCalculationService discountCalculationService;
    private final UserService userService;

    // ========== ADMIN APIs ==========

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create voucher", description = "Create a new voucher (Admin only)")
    public ResponseEntity<StandardResponse<VoucherResponse>> createVoucher(
            @Valid @RequestBody VoucherRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        // Get creator ID from userDetails (implement based on your auth system)
        Long creatorId = 1L; // TODO: Get from userDetails
        VoucherResponse response = voucherService.createVoucher(request, creatorId);
        return ResponseEntity.status(HttpStatus.CREATED).body(StandardResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update voucher", description = "Update existing voucher (Admin only)")
    public ResponseEntity<StandardResponse<VoucherResponse>> updateVoucher(
            @PathVariable Long id,
            @Valid @RequestBody VoucherRequest request) {
        VoucherResponse response = voucherService.updateVoucher(id, request);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all vouchers", description = "Get paginated list of all vouchers (Admin only)")
    public ResponseEntity<StandardResponse<Page<VoucherResponse>>> getAllVouchers(Pageable pageable) {
        Page<VoucherResponse> response = voucherService.getAllVouchers(pageable);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete voucher", description = "Soft delete a voucher (Admin only)")
    public ResponseEntity<StandardResponse<String>> deleteVoucher(@PathVariable Long id) {
        voucherService.deleteVoucher(id);
        return ResponseEntity.ok(StandardResponse.success("Voucher deleted successfully"));
    }

    @PostMapping("/{id}/grant")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Grant voucher to users", description = "Grant voucher to specific users (Admin only)")
    public ResponseEntity<StandardResponse<String>> grantVoucherToUsers(
            @PathVariable Long id,
            @RequestBody List<Long> userIds) {
        voucherService.grantVoucherToUsers(id, userIds);
        return ResponseEntity.ok(StandardResponse.success("Voucher granted successfully"));
    }

    @PostMapping(value = "/import", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Import vouchers from Excel", description = "Import vouchers from Excel file (Admin only)")
    public ResponseEntity<StandardResponse<String>> importVouchers(@RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        try {
            voucherService.importVouchers(file);
             return ResponseEntity.ok(StandardResponse.success("Vouchers imported successfully"));
        } catch (java.io.IOException e) {
             return ResponseEntity.badRequest().body(StandardResponse.error("Error importing file: " + e.getMessage()));
        }
    }

    @GetMapping("/export")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Export vouchers to Excel", description = "Export vouchers list to Excel file (Admin only)")
    public ResponseEntity<byte[]> exportVouchers() {
        try {
            byte[] data = voucherService.exportVouchers();
            String filename = "vouchers_" + java.time.LocalDateTime.now().format(java.time.format.DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss")) + ".xlsx";
            
            return ResponseEntity.ok()
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .contentType(org.springframework.http.MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                    .body(data);
        } catch (java.io.IOException e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // ========== PUBLIC & USER APIs ==========

    @GetMapping("/public")
    @Operation(summary = "Get public vouchers", description = "Get list of publicly available vouchers")
    public ResponseEntity<StandardResponse<List<VoucherResponse>>> getPublicVouchers() {
        List<VoucherResponse> response = voucherService.getPublicVouchers();
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping("/booking/available")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get available vouchers for booking", description = "Get list of vouchers available (User's wallet + Public) for booking")
    public ResponseEntity<StandardResponse<List<VoucherResponse>>> getAvailableVouchersForBooking() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        List<VoucherResponse> response = voucherService.getAvailableVouchersForBooking(user.getUserId());
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get voucher by ID", description = "Get detailed information about a voucher")
    public ResponseEntity<StandardResponse<VoucherResponse>> getVoucherById(@PathVariable Long id) {
        VoucherResponse response = voucherService.getVoucherById(id);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @PostMapping("/claim")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Claim voucher", description = "Claim a voucher by code")
    public ResponseEntity<StandardResponse<UserVoucherResponse>> claimVoucher(
            @Valid @RequestBody ClaimVoucherRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        UserVoucherResponse response = voucherService.claimVoucher(request.getCode(), user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(StandardResponse.success(response));
    }

    @GetMapping("/my-vouchers")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get my vouchers", description = "Get list of vouchers owned by current user")
    public ResponseEntity<StandardResponse<List<UserVoucherResponse>>> getMyVouchers(
            @RequestParam(required = false, defaultValue = "false") Boolean onlyAvailable) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        List<UserVoucherResponse> response = voucherService.getUserVouchers(user.getUserId(), onlyAvailable);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @PostMapping("/validate")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Validate voucher", description = "Check if a voucher code is valid for current user")
    public ResponseEntity<StandardResponse<Boolean>> validateVoucherCode(
            @RequestBody ClaimVoucherRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        boolean isValid = voucherService.validateVoucherCode(request.getCode(), user.getUserId());
        return ResponseEntity.ok(StandardResponse.success(isValid));
    }

    // ========== DISCOUNT CALCULATION APIs ==========

    @PostMapping("/calculate-discount")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Calculate discount", description = "Calculate total discount for cart with promotions and optional voucher")
    public ResponseEntity<StandardResponse<DiscountCalculationResponse>> calculateDiscount(
            @Valid @RequestBody ApplyDiscountRequest request) {
        DiscountCalculationResponse response = discountCalculationService.calculateDiscount(request);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping("/available-discounts")
    @PreAuthorize("isAuthenticated()")
    @Operation(summary = "Get available discounts", description = "Get list of all available discounts for current user")
    public ResponseEntity<StandardResponse<List<String>>> getAvailableDiscounts() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        List<String> discounts = discountCalculationService.getAvailableDiscounts(user.getUserId());
        return ResponseEntity.ok(StandardResponse.success(discounts));
    }

    // ========== INSTRUCTOR APIs ==========

    @PostMapping("/instructor")
    @PreAuthorize("hasRole('INSTRUCTOR')")
    @Operation(summary = "Create instructor voucher", description = "Create a voucher for own courses (Instructor only)")
    public ResponseEntity<StandardResponse<VoucherResponse>> createInstructorVoucher(
            @Valid @RequestBody VoucherRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);
        VoucherResponse response = voucherService.createVoucher(request, user.getUserId());
        return ResponseEntity.status(HttpStatus.CREATED).body(StandardResponse.success(response));
    }

}
