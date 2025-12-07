package org.example.elearning.repository;

import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.entity.WishlistEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WishlistRepository extends JpaRepository<WishlistEntity, Long> {

    List<WishlistEntity> findByUserAndIsDeletedFalse(UserEntity user);

    Optional<WishlistEntity> findByUserAndCourseAndIsDeletedFalse(UserEntity user, CourseEntity course);

    List<WishlistEntity> findByUser(UserEntity user);

    boolean existsByUserAndCourse(UserEntity user, CourseEntity course);
}


