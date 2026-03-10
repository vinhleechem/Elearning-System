package org.example.elearning.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class WishlistResponse {
    private Long wishlistId;
    private Long courseId;
    private String courseSlug;
    private String courseTitle;
    private String courseImage;
    private BigDecimal price;
    private BigDecimal discountPrice;
    private String instructorName;
    private Float rating;
    private LocalDateTime addedAt;
}
