package org.example.elearning.repository;

import org.example.elearning.entity.CommissionRateEntity;
import org.example.elearning.entity.InstructorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CommissionRateRepository extends JpaRepository<CommissionRateEntity, Long> {
    
    Optional<CommissionRateEntity> findByInstructorAndIsActiveTrue(InstructorEntity instructor);
    
    Optional<CommissionRateEntity> findByInstructor_InstructorIdAndIsActiveTrue(Long instructorId);
}
