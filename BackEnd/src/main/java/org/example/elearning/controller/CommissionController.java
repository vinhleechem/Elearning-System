package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CommissionRateRequest;
import org.example.elearning.dto.request.InstructorPayoutRequest;
import org.example.elearning.dto.response.*;
import org.example.elearning.enums.PayoutStatus;
import org.example.elearning.service.CommissionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/commission")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class CommissionController {

    CommissionService commissionService;

    // Commission Rate Management
    @PostMapping("/rates")
    @Operation(summary = "Create commission rate for instructor")
    public ResponseEntity<StandardResponse<CommissionRateResponse>> createCommissionRate(
            @Valid @RequestBody CommissionRateRequest request) {
        CommissionRateResponse response = commissionService.createCommissionRate(request);
        return ResponseEntity.ok(success("Tạo tỷ lệ hoa hồng thành công", response));
    }

    @PutMapping("/rates/{rateId}")
    @Operation(summary = "Update commission rate")
    public ResponseEntity<StandardResponse<CommissionRateResponse>> updateCommissionRate(
            @PathVariable Long rateId,
            @Valid @RequestBody CommissionRateRequest request) {
        CommissionRateResponse response = commissionService.updateCommissionRate(rateId, request);
        return ResponseEntity.ok(success("Cập nhật tỷ lệ hoa hồng thành công", response));
    }

    @GetMapping("/rates/{rateId}")
    @Operation(summary = "Get commission rate by ID")
    public ResponseEntity<StandardResponse<CommissionRateResponse>> getCommissionRate(
            @PathVariable Long rateId) {
        CommissionRateResponse response = commissionService.getCommissionRate(rateId);
        return ResponseEntity.ok(success("Lấy thông tin tỷ lệ hoa hồng thành công", response));
    }

    @GetMapping("/rates/instructor/{instructorId}")
    @Operation(summary = "Get active commission rate for instructor")
    public ResponseEntity<StandardResponse<CommissionRateResponse>> getActiveCommissionRate(
            @PathVariable Long instructorId) {
        CommissionRateResponse response = commissionService.getActiveCommissionRateByInstructor(instructorId);
        return ResponseEntity.ok(success("Lấy tỷ lệ hoa hồng hiện tại thành công", response));
    }

    @DeleteMapping("/rates/{rateId}")
    @Operation(summary = "Deactivate commission rate")
    public ResponseEntity<StandardResponse<Void>> deactivateCommissionRate(@PathVariable Long rateId) {
        commissionService.deactivateCommissionRate(rateId);
        return ResponseEntity.ok(success("Vô hiệu hóa tỷ lệ hoa hồng thành công", null));
    }

    // Instructor Payout Management
    @PostMapping("/payouts")
    @Operation(summary = "Create manual payout for instructor")
    public ResponseEntity<StandardResponse<InstructorPayoutResponse>> createPayout(
            @Valid @RequestBody InstructorPayoutRequest request) {
        InstructorPayoutResponse response = commissionService.createPayout(request);
        return ResponseEntity.ok(success("Tạo thanh toán cho giảng viên thành công", response));
    }

    @PostMapping("/payouts/generate")
    @Operation(summary = "Generate payout for instructor based on period")
    public ResponseEntity<StandardResponse<InstructorPayoutResponse>> generatePayout(
            @RequestParam Long instructorId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodStart,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime periodEnd) {
        InstructorPayoutResponse response = commissionService.generatePayoutForPeriod(instructorId, periodStart, periodEnd);
        return ResponseEntity.ok(success("Tạo thanh toán tự động thành công", response));
    }

    @GetMapping("/payouts/{payoutId}")
    @Operation(summary = "Get payout by ID")
    public ResponseEntity<StandardResponse<InstructorPayoutResponse>> getPayout(@PathVariable Long payoutId) {
        InstructorPayoutResponse response = commissionService.getPayout(payoutId);
        return ResponseEntity.ok(success("Lấy thông tin thanh toán thành công", response));
    }

    @GetMapping("/payouts/instructor/{instructorId}")
    @Operation(summary = "Get all payouts for instructor")
    public ResponseEntity<StandardResponse<List<InstructorPayoutResponse>>> getPayoutsByInstructor(
            @PathVariable Long instructorId) {
        List<InstructorPayoutResponse> response = commissionService.getPayoutsByInstructor(instructorId);
        return ResponseEntity.ok(success("Lấy lịch sử thanh toán thành công", response));
    }

    @GetMapping("/payouts/instructor/{instructorId}/page")
    @Operation(summary = "Get paginated payouts for instructor")
    public ResponseEntity<StandardResponse<Page<InstructorPayoutResponse>>> getPayoutsByInstructorPaged(
            @PathVariable Long instructorId,
            Pageable pageable) {
        Page<InstructorPayoutResponse> response = commissionService.getPayoutsByInstructor(instructorId, pageable);
        return ResponseEntity.ok(success("Lấy lịch sử thanh toán thành công", response));
    }

    @GetMapping("/payouts/status/{status}")
    @Operation(summary = "Get payouts by status")
    public ResponseEntity<StandardResponse<List<InstructorPayoutResponse>>> getPayoutsByStatus(
            @PathVariable PayoutStatus status) {
        List<InstructorPayoutResponse> response = commissionService.getPayoutsByStatus(status);
        return ResponseEntity.ok(success("Lấy danh sách thanh toán theo trạng thái thành công", response));
    }

    @GetMapping("/payouts")
    @Operation(summary = "Get all payouts (paginated)")
    public ResponseEntity<StandardResponse<Page<InstructorPayoutResponse>>> getAllPayouts(Pageable pageable) {
        Page<InstructorPayoutResponse> response = commissionService.getAllPayouts(pageable);
        return ResponseEntity.ok(success("Lấy danh sách thanh toán thành công", response));
    }

    @PutMapping("/payouts/{payoutId}/status")
    @Operation(summary = "Update payout status")
    public ResponseEntity<StandardResponse<InstructorPayoutResponse>> updatePayoutStatus(
            @PathVariable Long payoutId,
            @RequestParam PayoutStatus status,
            @RequestParam(required = false) String transactionId) {
        InstructorPayoutResponse response = commissionService.updatePayoutStatus(payoutId, status, transactionId);
        return ResponseEntity.ok(success("Cập nhật trạng thái thanh toán thành công", response));
    }

    @PutMapping("/payouts/{payoutId}/complete")
    @Operation(summary = "Mark payout as completed")
    public ResponseEntity<StandardResponse<InstructorPayoutResponse>> completePayout(
            @PathVariable Long payoutId,
            @RequestParam String transactionId) {
        InstructorPayoutResponse response = commissionService.completePayout(payoutId, transactionId);
        return ResponseEntity.ok(success("Hoàn tất thanh toán thành công", response));
    }
}
