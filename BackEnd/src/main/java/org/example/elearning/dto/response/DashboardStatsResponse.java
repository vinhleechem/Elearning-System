package org.example.elearning.dto.response;

import lombok.*;
import lombok.experimental.FieldDefaults;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class DashboardStatsResponse {
    Long totalUsers;
    Long totalOrders;
    Double totalRevenue;
    Long totalCourses;
    Double userGrowth;
    Double orderGrowth;
    Double revenueGrowth;
    Double courseGrowth;
}
