package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.DashboardStatsResponse;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.OrderRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.DashboardService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DashboardServiceImpl implements DashboardService {

    UserRepository userRepository;
    OrderRepository orderRepository;
    CourseRepository courseRepository;

    @Override
    public DashboardStatsResponse getDashboardStats() {
        // Get current period stats
        long totalUsers = userRepository.count();
        long totalOrders = orderRepository.count();
        long totalCourses = courseRepository.count();
        
        // Calculate total revenue from all orders (using finalAmount)
        List<OrderEntity> allOrders = orderRepository.findAll();
        double totalRevenue = allOrders.stream()
                .map(OrderEntity::getFinalAmount)
                .filter(amount -> amount != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();

        // Calculate growth percentages (compare last 30 days vs previous 30 days)
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime thirtyDaysAgo = now.minus(30, ChronoUnit.DAYS);
        LocalDateTime sixtyDaysAgo = now.minus(60, ChronoUnit.DAYS);

        // Users growth
        long usersLast30Days = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null && user.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();
        long usersPrevious30Days = userRepository.findAll().stream()
                .filter(user -> user.getCreatedAt() != null 
                        && user.getCreatedAt().isAfter(sixtyDaysAgo) 
                        && user.getCreatedAt().isBefore(thirtyDaysAgo))
                .count();
        double userGrowth = calculateGrowthPercentage(usersLast30Days, usersPrevious30Days);

        // Orders growth
        long ordersLast30Days = allOrders.stream()
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();
        long ordersPrevious30Days = allOrders.stream()
                .filter(order -> order.getCreatedAt() != null 
                        && order.getCreatedAt().isAfter(sixtyDaysAgo) 
                        && order.getCreatedAt().isBefore(thirtyDaysAgo))
                .count();
        double orderGrowth = calculateGrowthPercentage(ordersLast30Days, ordersPrevious30Days);

        // Revenue growth
        double revenueLast30Days = allOrders.stream()
                .filter(order -> order.getCreatedAt() != null && order.getCreatedAt().isAfter(thirtyDaysAgo))
                .map(OrderEntity::getFinalAmount)
                .filter(amount -> amount != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();
        double revenuePrevious30Days = allOrders.stream()
                .filter(order -> order.getCreatedAt() != null 
                        && order.getCreatedAt().isAfter(sixtyDaysAgo) 
                        && order.getCreatedAt().isBefore(thirtyDaysAgo))
                .map(OrderEntity::getFinalAmount)
                .filter(amount -> amount != null)
                .mapToDouble(BigDecimal::doubleValue)
                .sum();
        double revenueGrowth = calculateGrowthPercentage(revenueLast30Days, revenuePrevious30Days);

        // Courses growth
        long coursesLast30Days = courseRepository.findAll().stream()
                .filter(course -> course.getCreatedAt() != null && course.getCreatedAt().isAfter(thirtyDaysAgo))
                .count();
        long coursesPrevious30Days = courseRepository.findAll().stream()
                .filter(course -> course.getCreatedAt() != null 
                        && course.getCreatedAt().isAfter(sixtyDaysAgo) 
                        && course.getCreatedAt().isBefore(thirtyDaysAgo))
                .count();
        double courseGrowth = calculateGrowthPercentage(coursesLast30Days, coursesPrevious30Days);

        return DashboardStatsResponse.builder()
                .totalUsers(totalUsers)
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
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
