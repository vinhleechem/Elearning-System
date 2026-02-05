package org.example.elearning.specification;

import org.example.elearning.entity.ReviewEntity;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class ReviewSpecification {

    private ReviewSpecification() {
        throw new IllegalStateException("Utility class");
    }


    /**
     * Filter reviews by keyword in user name or course title.
     * @param keyword non-null, non-empty search keyword (validated by caller)
     */
    public static Specification<ReviewEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("user").get("fullName")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("course").get("title")), pattern)
            );
        };
    }

    /**
     * Filter reviews by rating.
     * @param rating non-null rating value (validated by caller)
     */
    public static Specification<ReviewEntity> filterByRating(Integer rating) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("rating"), rating);
    }

    /**
     * Filter reviews by course ID.
     * @param courseId non-null course ID (validated by caller)
     */
    public static Specification<ReviewEntity> filterByCourseId(Long courseId) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("course").get("courseId"), courseId);
    }

    /**
     * Filter reviews by deleted flag.
     * @param deleted whether to filter deleted or non-deleted reviews
     */
    public static Specification<ReviewEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }

    /**
     * Get only non-deleted reviews.
     */
    public static Specification<ReviewEntity> notDeleted() {
        return filterByDeleted(false);
    }

    /**
     * Composite filter for reviews with null-safe parameter handling.
     * @param keyword optional search keyword
     * @param rating optional rating filter
     * @param courseId optional course ID filter
     */
    public static Specification<ReviewEntity> filterReviews(String keyword, Integer rating, Long courseId) {
        Specification<ReviewEntity> spec = notDeleted();
        
        if (keyword != null && !keyword.trim().isEmpty()) {
            spec = spec.and(filterByKeyword(keyword.trim()));
        }
        
        if (rating != null) {
            spec = spec.and(filterByRating(rating));
        }
        
        if (courseId != null) {
            spec = spec.and(filterByCourseId(courseId));
        }
        
        return spec;
    }
}
