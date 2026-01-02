package org.example.elearning.repository;

import org.example.elearning.entity.InstructorPayoutEntity;
import org.example.elearning.enums.PayoutStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface InstructorPayoutRepository extends JpaRepository<InstructorPayoutEntity, Long> {
    
    List<InstructorPayoutEntity> findByInstructor_InstructorId(Long instructorId);
    
    Page<InstructorPayoutEntity> findByInstructor_InstructorId(Long instructorId, Pageable pageable);
    
    List<InstructorPayoutEntity> findByStatus(PayoutStatus status);
    
    Page<InstructorPayoutEntity> findByStatus(PayoutStatus status, Pageable pageable);
    
    @Query("SELECT p FROM InstructorPayoutEntity p WHERE p.instructor.instructorId = :instructorId AND p.status = :status")
    List<InstructorPayoutEntity> findByInstructorAndStatus(Long instructorId, PayoutStatus status);
}
