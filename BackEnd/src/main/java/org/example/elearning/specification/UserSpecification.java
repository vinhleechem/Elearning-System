package org.example.elearning.specification;

import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class UserSpecification {

    private UserSpecification() {
        throw new IllegalStateException("Utility class");
    }


    /**
     * Filter users by keyword in email or full name.
     * @param keyword non-null, non-empty search keyword (validated by caller)
     */
    public static Specification<UserEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), pattern)
            );
        };
    }

    /**
     * Filter users by status.
     * @param status non-null user status (validated by caller)
     */
    public static Specification<UserEntity> filterByStatus(UserStatus status) {
        return (root, query, criteriaBuilder) -> 
            criteriaBuilder.equal(root.get("status"), status);
    }

    /**
     * Filter users by deleted flag.
     * @param deleted whether to filter deleted or non-deleted users
     */
    public static Specification<UserEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) ->
                criteriaBuilder.equal(root.get("isDeleted"), deleted
        );
    }

    /**
     * Get only non-deleted users.
     */
    public static Specification<UserEntity> notDeleted() {
        return filterByDeleted(false);
    }

    /**
     * Get only active and non-deleted users.
     */
    public static Specification<UserEntity> activeUsers() {
        return filterByStatus(UserStatus.ACTIVE).and(filterByDeleted(false));
    }

    /**
     * Get only locked users.
     */
    public static Specification<UserEntity> lockedUsers() {
        return filterByStatus(UserStatus.LOCKED);
    }
}

