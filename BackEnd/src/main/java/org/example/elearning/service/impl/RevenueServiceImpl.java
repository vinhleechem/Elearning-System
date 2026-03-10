package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.response.*;
import org.example.elearning.repository.CommissionRateRepository;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.service.RevenueService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;
import java.sql.Date;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class RevenueServiceImpl implements RevenueService {

    OrderRepository orderRepository;
    CommissionRateRepository commissionRateRepository;
    
    private static final BigDecimal DEFAULT_COMMISSION_RATE = new BigDecimal("70.00");

    @Override
    public RevenueStatsResponse getRevenueStats() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).with(LocalTime.MIN);
        LocalDateTime startOfToday = now.with(LocalTime.MIN);
        
        // Total revenue (all time, completed orders only)
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();
        Long totalOrders = orderRepository.getTotalCompletedOrders();
        
        // Month revenue
        BigDecimal monthRevenue = orderRepository.getRevenueFrom(startOfMonth);
        Long monthOrders = orderRepository.getOrderCountFrom(startOfMonth);
        
        // Today revenue
        BigDecimal todayRevenue = orderRepository.getRevenueFrom(startOfToday);
        Long todayOrders = orderRepository.getOrderCountFrom(startOfToday);
        
        // Calculate growth rate (compare this month vs last month)
        LocalDateTime startOfLastMonth = startOfMonth.minusMonths(1);
        BigDecimal lastMonthRevenue = orderRepository.getRevenueBetween(startOfLastMonth, startOfMonth);
        
        Double growthRate = 0.0;
        if (lastMonthRevenue.compareTo(BigDecimal.ZERO) > 0) {
            growthRate = monthRevenue.subtract(lastMonthRevenue)
                    .divide(lastMonthRevenue, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        
        // Average order value
        BigDecimal averageOrderValue = BigDecimal.ZERO;
        if (totalOrders > 0) {
            averageOrderValue = totalRevenue.divide(BigDecimal.valueOf(totalOrders), 2, RoundingMode.HALF_UP);
        }
        
        return RevenueStatsResponse.builder()
                .totalRevenue(totalRevenue)
                .monthRevenue(monthRevenue)
                .todayRevenue(todayRevenue)
                .totalOrders(totalOrders)
                .monthOrders(monthOrders)
                .todayOrders(todayOrders)
                .growthRate(growthRate)
                .averageOrderValue(averageOrderValue)
                .build();
    }

    @Override
    public List<DailyRevenueResponse> getDailyRevenue(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getDailyRevenueNative(startDate, endDate);
        
        List<DailyRevenueResponse> dailyRevenues = new ArrayList<>();
        for (Object[] result : results) {
            LocalDate date = result[0] instanceof Date
                    ? ((Date) result[0]).toLocalDate()
                    : (LocalDate) result[0];
            dailyRevenues.add(DailyRevenueResponse.builder()
                    .date(date)
                    .revenue((BigDecimal) result[1])
                    .orderCount(((Number) result[2]).longValue())
                    .build());
        }
        
        return dailyRevenues;
    }

    @Override
    public List<CategoryRevenueResponse> getRevenueByCategory(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getRevenueByCategoryNative(startDate, endDate);
        
        // Calculate total revenue for percentage
        BigDecimal totalRevenue = results.stream()
                .map(r -> (BigDecimal) r[2])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<CategoryRevenueResponse> categoryRevenues = new ArrayList<>();
        for (Object[] result : results) {
            BigDecimal revenue = (BigDecimal) result[2];
            Double percentage = 0.0;
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            
            categoryRevenues.add(CategoryRevenueResponse.builder()
                    .categoryId(((Number) result[0]).longValue())
                    .categoryName((String) result[1])
                    .revenue(revenue)
                    .orderCount(((Number) result[3]).longValue())
                    .percentage(percentage)
                    .build());
        }
        
        return categoryRevenues;
    }

    @Override
    public List<CourseRevenueResponse> getTopCoursesByRevenue(int limit, LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getTopCoursesByRevenueNative(startDate, endDate, limit);
        
        List<CourseRevenueResponse> courseRevenues = new ArrayList<>();
        for (Object[] result : results) {
            courseRevenues.add(CourseRevenueResponse.builder()
                    .courseId(((Number) result[0]).longValue())
                    .courseTitle((String) result[1])
                    .categoryName((String) result[2])
                    .revenue((BigDecimal) result[3])
                    .salesCount(((Number) result[4]).longValue())
                    .averagePrice((BigDecimal) result[5])
                    .build());
        }
        
        return courseRevenues;
    }

    @Override
    public List<InstructorRevenueResponse> getRevenueByInstructor(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getRevenueByInstructorNative(startDate, endDate);
        
        List<InstructorRevenueResponse> instructorRevenues = new ArrayList<>();
        for (Object[] result : results) {
            Long instructorId = ((Number) result[0]).longValue();
            String instructorName = (String) result[1];
            BigDecimal revenue = (BigDecimal) result[2];
            Long orderCount = ((Number) result[3]).longValue();
            Long courseSales = ((Number) result[4]).longValue();
            
            // Get commission rate for instructor
            BigDecimal rate = commissionRateRepository.findByInstructor_InstructorIdAndIsActiveTrue(instructorId)
                    .map(cr -> cr.getRatePercentage())
                    .orElse(DEFAULT_COMMISSION_RATE);
            
            BigDecimal instructorRate = rate.divide(BigDecimal.valueOf(100), 4, RoundingMode.HALF_UP);
            BigDecimal instructorEarnings = revenue.multiply(instructorRate).setScale(2, RoundingMode.HALF_UP);
            BigDecimal commissionAmount = revenue.subtract(instructorEarnings);
            
            instructorRevenues.add(InstructorRevenueResponse.builder()
                    .instructorId(instructorId)
                    .instructorName(instructorName)
                    .revenue(revenue)
                    .orderCount(orderCount)
                    .courseSales(courseSales)
                    .commissionAmount(commissionAmount)
                    .instructorEarnings(instructorEarnings)
                    .build());
        }
        
        return instructorRevenues;
    }

    @Override
    public List<PaymentMethodRevenueResponse> getRevenueByPaymentMethod(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getRevenueByPaymentMethodNative(startDate, endDate);
        
        // Calculate total revenue for percentage
        BigDecimal totalRevenue = results.stream()
                .map(r -> (BigDecimal) r[1])
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        List<PaymentMethodRevenueResponse> methodRevenues = new ArrayList<>();
        for (Object[] result : results) {
            String paymentMethod = (String) result[0];
            BigDecimal revenue = (BigDecimal) result[1];
            Long transactionCount = ((Number) result[2]).longValue();
            
            Double percentage = 0.0;
            if (totalRevenue.compareTo(BigDecimal.ZERO) > 0) {
                percentage = revenue.divide(totalRevenue, 4, RoundingMode.HALF_UP)
                        .multiply(BigDecimal.valueOf(100))
                        .doubleValue();
            }
            
            methodRevenues.add(PaymentMethodRevenueResponse.builder()
                    .paymentMethod(paymentMethod != null ? paymentMethod : "Unknown")
                    .revenue(revenue)
                    .transactionCount(transactionCount)
                    .percentage(percentage)
                    .build());
        }
        
        return methodRevenues;
    }

    @Override
    public List<MonthlyRevenueResponse> getMonthlyRevenue(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getMonthlyRevenueNative(startDate, endDate);
        
        List<MonthlyRevenueResponse> monthlyRevenues = new ArrayList<>();
        for (Object[] result : results) {
            Integer year = ((Number) result[0]).intValue();
            Integer month = ((Number) result[1]).intValue();
            BigDecimal revenue = (BigDecimal) result[2];
            Long orderCount = ((Number) result[3]).longValue();
            
            String[] monthNames = {"", "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
                                   "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
            String period = monthNames[month] + " " + year;
            
            monthlyRevenues.add(MonthlyRevenueResponse.builder()
                    .year(year)
                    .month(month)
                    .revenue(revenue)
                    .orderCount(orderCount)
                    .period(period)
                    .build());
        }
        
        return monthlyRevenues;
    }

    @Override
    public List<MonthlyRevenueResponse> getQuarterlyRevenue(LocalDate startDate, LocalDate endDate) {
        List<Object[]> results = orderRepository.getQuarterlyRevenueNative(startDate, endDate);
        
        List<MonthlyRevenueResponse> quarterlyRevenues = new ArrayList<>();
        for (Object[] result : results) {
            Integer year = ((Number) result[0]).intValue();
            Integer quarter = ((Number) result[1]).intValue();
            BigDecimal revenue = (BigDecimal) result[2];
            Long orderCount = ((Number) result[3]).longValue();
            
            String period = "Q" + quarter + " " + year;
            
            quarterlyRevenues.add(MonthlyRevenueResponse.builder()
                    .year(year)
                    .quarter(quarter)
                    .revenue(revenue)
                    .orderCount(orderCount)
                    .period(period)
                    .build());
        }
        
        return quarterlyRevenues;
    }

    @Override
    public DiscountImpactResponse getDiscountImpact(LocalDate startDate, LocalDate endDate) {
        Object[] result = orderRepository.getDiscountImpactNative(startDate, endDate);
        
        // Handle potential type variations from database
        BigDecimal totalBeforeDiscount = convertToBigDecimal(result[0]);
        BigDecimal totalDiscount = convertToBigDecimal(result[1]);
        BigDecimal totalAfterDiscount = convertToBigDecimal(result[2]);
        Long orderCount = convertToLong(result[3]);
        Long ordersWithDiscount = convertToLong(result[4]);
        
        Double discountPercentage = 0.0;
        if (totalBeforeDiscount.compareTo(BigDecimal.ZERO) > 0) {
            discountPercentage = totalDiscount.divide(totalBeforeDiscount, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100))
                    .doubleValue();
        }
        
        Double orderDiscountRate = 0.0;
        if (orderCount > 0) {
            orderDiscountRate = (ordersWithDiscount.doubleValue() / orderCount) * 100;
        }
        
        return DiscountImpactResponse.builder()
                .totalBeforeDiscount(totalBeforeDiscount)
                .totalDiscount(totalDiscount)
                .totalAfterDiscount(totalAfterDiscount)
                .orderCount(orderCount)
                .ordersWithDiscount(ordersWithDiscount)
                .discountPercentage(discountPercentage)
                .orderDiscountRate(orderDiscountRate)
                .build();
    }
    
    private BigDecimal convertToBigDecimal(Object value) {
        if (value == null) {
            return BigDecimal.ZERO;
        }
        if (value instanceof BigDecimal) {
            return (BigDecimal) value;
        }
        if (value instanceof Number) {
            return BigDecimal.valueOf(((Number) value).doubleValue());
        }
        return new BigDecimal(value.toString());
    }
    
    private Long convertToLong(Object value) {
        if (value == null) {
            return 0L;
        }
        if (value instanceof Long) {
            return (Long) value;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.parseLong(value.toString());
    }
}
