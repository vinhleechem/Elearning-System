package org.example.elearning.service;

import org.example.elearning.dto.response.*;

import java.time.LocalDate;
import java.util.List;

public interface RevenueService {
    
    // Dashboard Overview
    RevenueStatsResponse getRevenueStats();
    
    List<DailyRevenueResponse> getDailyRevenue(LocalDate startDate, LocalDate endDate);
    
    // Revenue Analytics
    List<CategoryRevenueResponse> getRevenueByCategory(LocalDate startDate, LocalDate endDate);
    
    List<CourseRevenueResponse> getTopCoursesByRevenue(int limit, LocalDate startDate, LocalDate endDate);
    
    List<InstructorRevenueResponse> getRevenueByInstructor(LocalDate startDate, LocalDate endDate);
    
    List<PaymentMethodRevenueResponse> getRevenueByPaymentMethod(LocalDate startDate, LocalDate endDate);
    
    // Time-based Revenue Reports
    List<MonthlyRevenueResponse> getMonthlyRevenue(LocalDate startDate, LocalDate endDate);
    
    List<MonthlyRevenueResponse> getQuarterlyRevenue(LocalDate startDate, LocalDate endDate);
    
    // Discount Impact Analysis
    DiscountImpactResponse getDiscountImpact(LocalDate startDate, LocalDate endDate);
}

