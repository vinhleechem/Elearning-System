package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.DashboardStatsResponse;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardServiceImpl implements DashboardService {

    UserRepository userRepository;
    OrderRepository orderRepository;
    CourseRepository courseRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        // Calculate time periods
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
        LocalDateTime sixtyDaysAgo = now.minus(60, ChronoUnit.DAYS);

        // Get current totals
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalCourses = courseRepository.count();
        BigDecimal totalRevenue = orderRepository.getTotalRevenue();

        // Get counts for last 30 days and previous 30 days using optimized queries
        long usersLast30Days = userRepository.countByCreatedAtBetween(thirtyDaysAgo, now);
        long usersPrevious30Days = userRepository.countByCreatedAtBetween(sixtyDaysAgo, thirtyDaysAgo);

        long ordersLast30Days = orderRepository.countByCreatedAtBetween(thirtyDaysAgo, now);
        long ordersPrevious30Days = orderRepository.countByCreatedAtBetween(sixtyDaysAgo, thirtyDaysAgo);

        BigDecimal revenueLast30Days = orderRepository.getRevenueBetween(thirtyDaysAgo, now);
        BigDecimal revenuePrevious30Days = orderRepository.getRevenueBetween(sixtyDaysAgo, thirtyDaysAgo);

        long coursesLast30Days = courseRepository.countByCreatedAtBetween(thirtyDaysAgo, now);
        long coursesPrevious30Days = courseRepository.countByCreatedAtBetween(sixtyDaysAgo, thirtyDaysAgo);

        // Calculate growth percentages
        double userGrowth = calculateGrowthPercentage(usersLast30Days, usersPrevious30Days);
        double orderGrowth = calculateGrowthPercentage(ordersLast30Days, ordersPrevious30Days);
        double revenueGrowth = calculateGrowthPercentage(
                revenueLast30Days.doubleValue(), 
                revenuePrevious30Days.doubleValue()
        );
        double courseGrowth = calculateGrowthPercentage(coursesLast30Days, coursesPrevious30Days);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue.doubleValue())
                .totalCourses(totalCourses)
                .userGrowth(userGrowth)
                .orderGrowth(orderGrowth)
                .revenueGrowth(revenueGrowth)
                .courseGrowth(courseGrowth)
                .build();
    }

    private double calculateGrowthPercentage(double current, double previous) {
        if (previous == 0) {
            return current > 0 ? 100.0 : 0.0;
        }
        return ((current - previous) / previous) * 100.0;
    }
}
