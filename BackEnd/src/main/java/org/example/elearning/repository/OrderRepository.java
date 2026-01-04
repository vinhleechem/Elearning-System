package org.example.elearning.repository;

import org.example.elearning.dto.response.CategoryRevenueResponse;
import org.example.elearning.dto.response.CourseRevenueResponse;
import org.example.elearning.dto.response.DailyRevenueResponse;
import org.example.elearning.entity.OrderEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.OrderStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OrderRepository extends JpaRepository<OrderEntity, Long>, JpaSpecificationExecutor<OrderEntity> {

    List<OrderEntity> findByUserAndStatus(UserEntity user, OrderStatus status);

    Page<OrderEntity> findByUser(UserEntity user, Pageable pageable);
    
    // Revenue Analytics Queries
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM OrderEntity o WHERE o.status = 'COMPLETED'")
    BigDecimal getTotalRevenue();
    
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'COMPLETED'")
    Long getTotalCompletedOrders();
    
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM OrderEntity o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    BigDecimal getRevenueFrom(LocalDateTime startDate);
    
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate")
    Long getOrderCountFrom(LocalDateTime startDate);
    
    @Query("SELECT COALESCE(SUM(o.finalAmount), 0) FROM OrderEntity o WHERE o.status = 'COMPLETED' AND o.createdAt >= :startDate AND o.createdAt < :endDate")
    BigDecimal getRevenueBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT COUNT(o) FROM OrderEntity o WHERE o.createdAt >= :startDate AND o.createdAt < :endDate")
    Long countByCreatedAtBetween(LocalDateTime startDate, LocalDateTime endDate);
    
    // Daily Revenue - using native query for date functions
    @Query(value = "SELECT DATE(o.created_at) as date, COALESCE(SUM(o.final_amount), 0) as revenue, COUNT(o.order_id) as orderCount " +
           "FROM orders o " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY DATE(o.created_at) " +
           "ORDER BY DATE(o.created_at)", nativeQuery = true)
    List<Object[]> getDailyRevenueNative(LocalDate startDate, LocalDate endDate);
    
    // Category Revenue - using native query
    @Query(value = "SELECT c.id, c.name, COALESCE(SUM(oi.price), 0) as revenue, COUNT(DISTINCT o.order_id) as orderCount " +
           "FROM orders o " +
           "JOIN order_items oi ON o.order_id = oi.order_id " +
           "JOIN courses course ON oi.course_id = course.course_id " +
           "JOIN categories c ON course.category_id = c.id " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY c.id, c.name " +
           "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getRevenueByCategoryNative(LocalDate startDate, LocalDate endDate);
    
    // Top Courses - using native query
    @Query(value = "SELECT course.course_id, course.title, c.name, COALESCE(SUM(oi.price), 0) as revenue, COUNT(oi.order_item_id) as salesCount, AVG(oi.price) as avgPrice " +
           "FROM orders o " +
           "JOIN order_items oi ON o.order_id = oi.order_id " +
           "JOIN courses course ON oi.course_id = course.course_id " +
           "JOIN categories c ON course.category_id = c.id " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY course.course_id, course.title, c.name " +
           "ORDER BY revenue DESC " +
           "LIMIT :limit", nativeQuery = true)
    List<Object[]> getTopCoursesByRevenueNative(LocalDate startDate, LocalDate endDate, int limit);
    
    // Revenue by Instructor
    @Query(value = "SELECT i.instructor_id, u.full_name, COALESCE(SUM(oi.price), 0) as revenue, " +
           "COUNT(DISTINCT o.order_id) as orderCount, COUNT(oi.order_item_id) as courseSales " +
           "FROM orders o " +
           "JOIN order_items oi ON o.order_id = oi.order_id " +
           "JOIN courses course ON oi.course_id = course.course_id " +
           "JOIN instructors i ON course.instructor_id = i.instructor_id " +
           "JOIN users u ON i.user_id = u.user_id " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY i.instructor_id, u.full_name " +
           "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getRevenueByInstructorNative(LocalDate startDate, LocalDate endDate);
    
    // Revenue by Payment Method
    @Query(value = "SELECT p.method, COALESCE(SUM(p.amount), 0) as revenue, COUNT(DISTINCT p.payment_id) as transactionCount " +
           "FROM payments p " +
           "JOIN orders o ON p.order_id = o.order_id " +
           "WHERE o.status = 'COMPLETED' AND DATE(p.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY p.method " +
           "ORDER BY revenue DESC", nativeQuery = true)
    List<Object[]> getRevenueByPaymentMethodNative(LocalDate startDate, LocalDate endDate);
    
    // Monthly Revenue for comparison
    @Query(value = "SELECT EXTRACT(YEAR FROM o.created_at) as year, EXTRACT(MONTH FROM o.created_at) as month, " +
           "COALESCE(SUM(o.final_amount), 0) as revenue, COUNT(o.order_id) as orderCount " +
           "FROM orders o " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(MONTH FROM o.created_at) " +
           "ORDER BY year, month", nativeQuery = true)
    List<Object[]> getMonthlyRevenueNative(LocalDate startDate, LocalDate endDate);
    
    // Quarterly Revenue
    @Query(value = "SELECT EXTRACT(YEAR FROM o.created_at) as year, EXTRACT(QUARTER FROM o.created_at) as quarter, " +
           "COALESCE(SUM(o.final_amount), 0) as revenue, COUNT(o.order_id) as orderCount " +
           "FROM orders o " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate " +
           "GROUP BY EXTRACT(YEAR FROM o.created_at), EXTRACT(QUARTER FROM o.created_at) " +
           "ORDER BY year, quarter", nativeQuery = true)
    List<Object[]> getQuarterlyRevenueNative(LocalDate startDate, LocalDate endDate);
    
    // Discount Impact Analysis
    @Query(value = "SELECT " +
           "CAST(COALESCE(SUM(o.total_amount), 0) AS DECIMAL(19,2)) as totalBeforeDiscount, " +
           "CAST(COALESCE(SUM(o.discount_amount), 0) AS DECIMAL(19,2)) as totalDiscount, " +
           "CAST(COALESCE(SUM(o.final_amount), 0) AS DECIMAL(19,2)) as totalAfterDiscount, " +
           "CAST(COUNT(o.order_id) AS BIGINT) as orderCount, " +
           "CAST(COUNT(CASE WHEN o.discount_amount > 0 THEN 1 END) AS BIGINT) as ordersWithDiscount " +
           "FROM orders o " +
           "WHERE o.status = 'COMPLETED' AND DATE(o.created_at) BETWEEN :startDate AND :endDate", nativeQuery = true)
    Object[] getDiscountImpactNative(LocalDate startDate, LocalDate endDate);
}



