package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.*;
import org.example.elearning.service.RevenueService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/revenue")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@PreAuthorize("hasRole('ADMIN')")
public class RevenueController {

    RevenueService revenueService;

    @GetMapping("/stats")
    @Operation(summary = "Get revenue statistics overview")
    public ResponseEntity<StandardResponse<RevenueStatsResponse>> getRevenueStats() {
        RevenueStatsResponse stats = revenueService.getRevenueStats();
        return ResponseEntity.ok(success("Lấy thống kê doanh thu thành công", stats));
    }

    @GetMapping("/daily")
    @Operation(summary = "Get daily revenue for chart")
    public ResponseEntity<StandardResponse<List<DailyRevenueResponse>>> getDailyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<DailyRevenueResponse> dailyRevenue = revenueService.getDailyRevenue(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo ngày thành công", dailyRevenue));
    }

    @GetMapping("/by-category")
    @Operation(summary = "Get revenue breakdown by category")
    public ResponseEntity<StandardResponse<List<CategoryRevenueResponse>>> getRevenueByCategory(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CategoryRevenueResponse> categoryRevenue = revenueService.getRevenueByCategory(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo danh mục thành công", categoryRevenue));
    }

    @GetMapping("/top-courses")
    @Operation(summary = "Get top selling courses by revenue")
    public ResponseEntity<StandardResponse<List<CourseRevenueResponse>>> getTopCourses(
            @RequestParam(defaultValue = "10") int limit,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<CourseRevenueResponse> topCourses = revenueService.getTopCoursesByRevenue(limit, startDate, endDate);
        return ResponseEntity.ok(success("Lấy top khóa học thành công", topCourses));
    }

    @GetMapping("/by-instructor")
    @Operation(summary = "Get revenue breakdown by instructor")
    public ResponseEntity<StandardResponse<List<InstructorRevenueResponse>>> getRevenueByInstructor(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<InstructorRevenueResponse> instructorRevenue = revenueService.getRevenueByInstructor(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo giảng viên thành công", instructorRevenue));
    }

    @GetMapping("/by-payment-method")
    @Operation(summary = "Get revenue breakdown by payment method")
    public ResponseEntity<StandardResponse<List<PaymentMethodRevenueResponse>>> getRevenueByPaymentMethod(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<PaymentMethodRevenueResponse> methodRevenue = revenueService.getRevenueByPaymentMethod(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo phương thức thanh toán thành công", methodRevenue));
    }

    @GetMapping("/monthly")
    @Operation(summary = "Get monthly revenue comparison")
    public ResponseEntity<StandardResponse<List<MonthlyRevenueResponse>>> getMonthlyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<MonthlyRevenueResponse> monthlyRevenue = revenueService.getMonthlyRevenue(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo tháng thành công", monthlyRevenue));
    }

    @GetMapping("/quarterly")
    @Operation(summary = "Get quarterly revenue comparison")
    public ResponseEntity<StandardResponse<List<MonthlyRevenueResponse>>> getQuarterlyRevenue(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        List<MonthlyRevenueResponse> quarterlyRevenue = revenueService.getQuarterlyRevenue(startDate, endDate);
        return ResponseEntity.ok(success("Lấy doanh thu theo quý thành công", quarterlyRevenue));
    }

    @GetMapping("/discount-impact")
    @Operation(summary = "Get discount impact analysis")
    public ResponseEntity<StandardResponse<DiscountImpactResponse>> getDiscountImpact(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        DiscountImpactResponse impact = revenueService.getDiscountImpact(startDate, endDate);
        return ResponseEntity.ok(success("Lấy phân tích ảnh hưởng giảm giá thành công", impact));
    }
}
