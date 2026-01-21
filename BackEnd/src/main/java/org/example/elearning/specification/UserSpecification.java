package org.example.elearning.specification;

import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.springframework.data.jpa.domain.Specification;

import java.util.Locale;

public final class UserSpecification {

    private UserSpecification() {
        throw new IllegalStateException("Utility class");
    }


    public static Specification<UserEntity> filterByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            if (keyword == null || keyword.trim().isEmpty()) {
                return criteriaBuilder.conjunction();
            }
            String pattern = "%" + keyword.toLowerCase(Locale.ROOT) + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("email")), pattern),
                    criteriaBuilder.like(criteriaBuilder.lower(root.get("fullName")), pattern)
            );
        };
    }


    public static Specification<UserEntity> filterByStatus(UserStatus status) {
        return (root, query, criteriaBuilder) -> {
            if (status == null) {
                return criteriaBuilder.conjunction();
            }
            return criteriaBuilder.equal(root.get("status"), status);
        };
    }


    public static Specification<UserEntity> filterByDeleted(boolean deleted) {
        return (root, query, criteriaBuilder) -> criteriaBuilder.equal(root.get("isDeleted"), deleted);
    }


    public static Specification<UserEntity> notDeleted() {
        return filterByDeleted(false);
    }


    public static Specification<UserEntity> activeUsers() {
        return filterByStatus(UserStatus.ACTIVE).and(filterByDeleted(false));
    }


    public static Specification<UserEntity> lockedUsers() {
        return filterByStatus(UserStatus.LOCKED);
    }
}

