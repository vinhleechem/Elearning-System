package org.example.elearning.repository;

import org.example.elearning.entity.CartEntity;
import org.example.elearning.entity.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CartRepository extends JpaRepository<CartEntity, Long> {

    Optional<CartEntity> findByUserAndIsDeletedFalse(UserEntity user);

    Optional<CartEntity> findByUser(UserEntity user);
}


