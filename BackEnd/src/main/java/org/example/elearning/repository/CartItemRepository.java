package org.example.elearning.repository;

import org.example.elearning.entity.CartEntity;
import org.example.elearning.entity.CartItemEntity;
import org.example.elearning.entity.CourseEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CartItemRepository extends JpaRepository<CartItemEntity, Long> {

    List<CartItemEntity> findByCartAndIsDeletedFalse(CartEntity cart);

    Optional<CartItemEntity> findByCartAndCourseAndIsDeletedFalse(CartEntity cart, CourseEntity course);

    List<CartItemEntity> findByCart(CartEntity cart);

    boolean existsByCartAndCourse(CartEntity cart, CourseEntity course);

    void deleteByCart(CartEntity cart);
}


