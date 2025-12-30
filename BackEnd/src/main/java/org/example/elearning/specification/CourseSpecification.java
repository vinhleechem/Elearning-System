package org.example.elearning.specification;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class CourseSpecification {

    private CourseSpecification() {
        throw new IllegalStateException("Utility class");
    }

    /**
     * Filter courses by keyword (search in title)
     */
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

    /**
     * Filter courses by status
     */
    public static Specification<CourseEntity> filterByStatus(CourseStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }

    /**
     * Filter courses by deleted status
     */
    public static Specification<CourseEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }

    /**
     * Filter published courses (status = PUBLISHED and not deleted)
     */
    public static Specification<CourseEntity> publishedCourses() {
        return filterByStatus(CourseStatus.PUBLISHED).and(filterByDeleted(false));
    }

    /**
     * Filter not deleted courses
     */
    public static Specification<CourseEntity> notDeleted() {
        return filterByDeleted(false);
    }

    /**
     * Filter courses by instructor ID
     */
    public static Specification<CourseEntity> filterByInstructorId(Long instructorId) {
        return (root, query, criteriaBuilder) -> {
            if (instructorId == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("instructor").get("instructorId"), instructorId);
        };
    }
}

