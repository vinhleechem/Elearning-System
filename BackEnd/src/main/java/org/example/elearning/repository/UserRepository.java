package org.example.elearning.repository;

import org.example.elearning.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;
@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long>, JpaSpecificationExecutor<UserEntity> {
    Optional<UserEntity> findByEmail(String email);
//    Optional<UserEntity> findByEmailAndDeletedFalse(String email);
    boolean existsByEmail(String email);
//    List<UserEntity> findByFullNameContainingIgnoreCaseAndDeletedFalse(String fullName);
}
