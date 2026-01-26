package org.example.elearning.specification;

import org.example.elearning.entity.ConversationEntity;
import org.springframework.data.jpa.domain.Specification;

import jakarta.persistence.criteria.Predicate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

public class ConversationSpecification {

    public static Specification<ConversationEntity> filterConversations(
            Long courseId,
            Long instructorId,
            Long studentId,
            Boolean isArchived,
            Boolean isLocked,
            LocalDateTime startDate,
            LocalDateTime endDate,
            String keyword
    ) {
        return (root, query, criteriaBuilder) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (courseId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("course").get("courseId"), courseId
                ));
            }

            if (instructorId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("instructor").get("instructorId"), instructorId
                ));
            }

            if (studentId != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("student").get("userId"), studentId
                ));
            }

            if (isArchived != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("isArchived"), isArchived
                ));
            }

            if (isLocked != null) {
                predicates.add(criteriaBuilder.equal(
                        root.get("isLocked"), isLocked
                ));
            }

            if (startDate != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(
                        root.get("createdAt"), startDate
                ));
            }

            if (endDate != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(
                        root.get("createdAt"), endDate
                ));
            }

            if (keyword != null && !keyword.trim().isEmpty()) {
                predicates.add(criteriaBuilder.like(
                        criteriaBuilder.lower(root.join("messages").get("content")),
                        "%" + keyword.toLowerCase() + "%"
                ));
            }

            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));

            return criteriaBuilder.and(predicates.toArray(new Predicate[0]));
        };
    }

    public static Specification<ConversationEntity> byStudent(Long studentId) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("student").get("userId"), studentId);
        };
    }

    public static Specification<ConversationEntity> byInstructor(Long instructorId) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("instructor").get("instructorId"), instructorId);
        };
    }

    public static Specification<ConversationEntity> notArchived() {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("isArchived"), false);
        };
    }

    public static Specification<ConversationEntity> archived() {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("isArchived"), true);
        };
    }

    public static Specification<ConversationEntity> hasInstructor(Long instructorId) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("instructor").get("instructorId"), instructorId);
        };
    }

    public static Specification<ConversationEntity> hasCourse(Long courseId) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("course").get("courseId"), courseId);
        };
    }

    public static Specification<ConversationEntity> isArchived(Boolean archived) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            return criteriaBuilder.equal(root.get("isArchived"), archived);
        };
    }

    public static Specification<ConversationEntity> searchByKeyword(String keyword) {
        return (root, query, criteriaBuilder) -> {
            query.orderBy(criteriaBuilder.desc(
                    criteriaBuilder.coalesce(root.get("lastMessageAt"), root.get("createdAt"))
            ));
            String pattern = "%" + keyword.toLowerCase() + "%";
            return criteriaBuilder.or(
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("student").get("fullName")),
                            pattern
                    ),
                    criteriaBuilder.like(
                            criteriaBuilder.lower(root.get("course").get("title")),
                            pattern
                    )
            );
        };
    }
}