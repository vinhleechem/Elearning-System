package org.example.elearning.specification;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseLevel;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.Locale;

public final class CourseSpecification {

    private CourseSpecification() {
        throw new IllegalStateException("Utility class");
    }

    public static Specification<CourseEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    pattern
            );
        };
    }


    public static Specification<CourseEntity> filterByStatus(CourseStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }


    public static Specification<CourseEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }


    public static Specification<CourseEntity> publishedCourses() {
        return filterByStatus(CourseStatus.PUBLISHED).and(filterByDeleted(false));
    }


    public static Specification<CourseEntity> notDeleted() {
        return filterByDeleted(false);
    }


    public static Specification<CourseEntity> filterByInstructorId(Long instructorId) {
        return (root, query, criteriaBuilder) -> {
            if (instructorId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("instructor").get("instructorId"), instructorId);
        };
    }

    public static Specification<CourseEntity> filterByCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder) -> {
            if (categoryId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("category").get("categoryId"), categoryId);
        };
    }

    public static Specification<CourseEntity> filterByLevel(CourseLevel level) {
        return (root, query, criteriaBuilder) -> {
            if (level == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("level"), level);
        };
    }

    public static Specification<CourseEntity> filterByMinPrice(Double minPrice) {
        return (root, query, criteriaBuilder) -> {
            if (minPrice == null) {
                return criteriaBuilder.conjunction();
            }
            BigDecimal minPriceBD = BigDecimal.valueOf(minPrice);
            // Check currentPrice first, if null then check price
            return criteriaBuilder.or(
                criteriaBuilder.greaterThanOrEqualTo(root.get("currentPrice"), minPriceBD),
                criteriaBuilder.and(
                    criteriaBuilder.isNull(root.get("currentPrice")),
                    criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPriceBD)
                )
            );
        };
    }


    public static Specification<CourseEntity> filterByMaxPrice(Double maxPrice) {
        return (root, query, criteriaBuilder) -> {
            if (maxPrice == null) {
                return criteriaBuilder.conjunction();
            }
            BigDecimal maxPriceBD = BigDecimal.valueOf(maxPrice);
            // Check currentPrice first, if null then check price
            return criteriaBuilder.or(
                criteriaBuilder.lessThanOrEqualTo(root.get("currentPrice"), maxPriceBD),
                criteriaBuilder.and(
                    criteriaBuilder.isNull(root.get("currentPrice")),
                    criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPriceBD)
                )
            );
        };
    }


    public static Specification<CourseEntity> filterByMinRating(Double minRating) {
        return (root, query, criteriaBuilder) -> {
            if (minRating == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating);
        };
    }
}

