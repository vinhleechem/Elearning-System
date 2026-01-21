package org.example.elearning.repository;

import java.util.List;
import java.util.Optional;

import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {
    Optional<UserEntity> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Page<UserEntity> findByIsDeletedFalse(Pageable pageable);
    
    Page<UserEntity> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseAndIsDeletedFalse(
        String email, String fullName, Pageable pageable);
    
    @Query("SELECT u FROM UserEntity u JOIN u.roles r WHERE r.roleName = 'ADMIN' AND u.isDeleted = false")
    List<UserEntity> findAllAdmins();
    
    @Query("SELECT COUNT(u) FROM UserEntity u WHERE u.createdAt >= :startDate AND u.createdAt < :endDate")
    Long countByCreatedAtBetween(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate);

}
