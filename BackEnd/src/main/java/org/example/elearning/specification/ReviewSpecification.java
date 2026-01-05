package org.example.elearning.specification;

import org.example.elearning.entity.ReviewEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ReviewSpecification {

    private ReviewSpecification() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Filter reviews by keyword (search in user name or course title)
     */
    public static Specification<ReviewEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("fullName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("course").get("title")), pattern)
            );
        };
    }

    /**
     * Filter reviews by rating
     */
    public static Specification<ReviewEntity> filterByRating(Integer rating) {
        return (root, query, criteriaBuilder) -> {
            if (rating == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("rating"), rating);
        };
    }

    /**
     * Filter reviews by course ID
     */
    public static Specification<ReviewEntity> filterByCourseId(Long courseId) {
        return (root, query, criteriaBuilder) -> {
            if (courseId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("course").get("courseId"), courseId);
        };
    }

    /**
     * Filter reviews by deleted status
     */
    public static Specification<ReviewEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }

    /**
     * Filter active reviews (not deleted)
     */
    public static Specification<ReviewEntity> notDeleted() {
        return filterByDeleted(false);
    }

    /**
     * Combine all filters
     */
    public static Specification<ReviewEntity> filterReviews(String keyword, Integer rating, Long courseId) {
        return Specification.where(notDeleted())
                .and(filterByKeyword(keyword))
                .and(filterByRating(rating))
                .and(filterByCourseId(courseId));
    }
}
