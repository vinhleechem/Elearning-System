package org.example.elearning.repository;

import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface InstructorRepository extends JpaRepository<InstructorEntity, Long> {
    Optional<InstructorEntity> findByUser(UserEntity user);
    boolean existsByUser(UserEntity user);
}


