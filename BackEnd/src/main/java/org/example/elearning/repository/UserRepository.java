package org.example.elearning.repository;

import java.util.Optional;

import org.example.elearning.entity.UserEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {
    Optional<UserEntity> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    Page<UserEntity> findByIsDeletedFalse(Pageable pageable);
    
    Page<UserEntity> findByEmailContainingIgnoreCaseOrFullNameContainingIgnoreCaseAndIsDeletedFalse(
        String email, String fullName, Pageable pageable);
}
