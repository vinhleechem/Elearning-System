package org.example.elearning.specification;

import jakarta.persistence.criteria.Expression;
import jakarta.persistence.criteria.Predicate;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseLevel;
import org.springframework.data.jpa.domain.Specification;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;

public final class CourseSpecification {


    public static Specification<CourseEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.like(
                    criteriaBuilder.lower(root.get("title")),
                    pattern);
        };
    }


    public static Specification<CourseEntity> filterByStatus(CourseStatus status) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.equal(root.get("status"), status);
    }


    public static Specification<CourseEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }


    public static Specification<CourseEntity> publishedCourses() {
        return filterByStatus(CourseStatus.PUBLISHED).and(filterByDeleted(false));
    }


    public static Specification<CourseEntity> notDeleted() {
        return filterByDeleted(false);
    }


    public static Specification<CourseEntity> filterByInstructorId(Long instructorId) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.equal(root.get("instructor").get("instructorId"), instructorId);
    }


    public static Specification<CourseEntity> filterByCategoryId(Long categoryId) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.equal(root.get("category").get("categoryId"), categoryId);
    }


    public static Specification<CourseEntity> filterByLevel(CourseLevel level) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.equal(root.get("level"), level);
    }


    public static Specification<CourseEntity> filterByPriceRange(Double minPrice, Double maxPrice) {
        return (root, query, criteriaBuilder) -> {
            Expression<BigDecimal> currentPrice = root.get("currentPrice");
            Expression<BigDecimal> price = root.get("price");

            Expression<BigDecimal> effectivePrice = criteriaBuilder.coalesce(currentPrice, price);

            List<Predicate> predicates = new ArrayList<>();

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        effectivePrice,
                        BigDecimal.valueOf(minPrice)
                ));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        effectivePrice,
                        BigDecimal.valueOf(maxPrice)
                ));
            }

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<CourseEntity> filterByMinRating(Double minRating) {
        return (root, query, criteriaBuilder)
                    -> criteriaBuilder.greaterThanOrEqualTo(root.get("averageRating"), minRating);
    }
}
