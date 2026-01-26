package org.example.elearning.repository;

import org.example.elearning.entity.ConversationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ConversationRepository extends JpaRepository<ConversationEntity, Long>, JpaSpecificationExecutor<ConversationEntity> {


    Optional<ConversationEntity> findByCourse_CourseIdAndStudent_UserIdAndInstructor_InstructorId(Long courseCourseId,
                                                                                                  Long studentUserId,
                                                                                                  Long instructorInstructorId);
    @Query("SELECT c FROM ConversationEntity c WHERE c.student.userId = :userId AND c.isArchived = :archived ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    Page<ConversationEntity> findMyConversationsByStudent(@Param("userId") Long userId, @Param("archived") boolean archived, Pageable pageable);

    @Query("SELECT c FROM ConversationEntity c WHERE c.instructor.instructorId = :userId AND c.isArchived = :archived ORDER BY COALESCE(c.lastMessageAt, c.createdAt) DESC")
    Page<ConversationEntity> findMyConversationsByInstructor(@Param("userId") Long userId, @Param("archived") boolean archived, Pageable pageable);


    @Query("SELECT COALESCE(SUM(c.studentUnreadCount), 0) FROM ConversationEntity c WHERE c.student.userId = :userId")
    Long countStudentUnreadMessages(@Param("userId") Long userId);

    @Query("SELECT COALESCE(SUM(c.instructorUnreadCount), 0) FROM ConversationEntity c WHERE c.instructor.user.userId = :userId")
    Long countInstructorUnreadMessages(@Param("userId") Long userId);
}
