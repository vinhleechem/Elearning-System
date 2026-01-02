package org.example.elearning.repository;

import org.example.elearning.entity.NotificationEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {

    List<NotificationEntity> findByUserAndIsDeletedFalseOrderByCreatedAtDesc(UserEntity user);

    Page<NotificationEntity> findByUser(UserEntity user, Pageable pageable);

    List<NotificationEntity> findByUserAndIsReadFalse(UserEntity user);

    Long countByUserAndIsReadFalse(UserEntity user);

    Page<NotificationEntity> findByIsDeletedFalse(Pageable pageable);

    Page<NotificationEntity> findByUserAndIsDeletedFalse(UserEntity user, Pageable pageable);

    Page<NotificationEntity> findByIsReadAndIsDeletedFalse(Boolean isRead, Pageable pageable);

    Page<NotificationEntity> findByUserAndIsReadAndIsDeletedFalse(UserEntity user, Boolean isRead, Pageable pageable);

    Page<NotificationEntity> findByUserFullNameContainingAndIsDeletedFalse(String fullName, Pageable pageable);

    Page<NotificationEntity> findByUserFullNameContainingAndIsReadAndIsDeletedFalse(String fullName, Boolean isRead, Pageable pageable);
}
