package org.example.elearning.repository;

import org.example.elearning.entity.RoleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;


@Repository
public interface RoleRepository extends JpaRepository<RoleEntity, Long> {
    Optional<org.example.elearning.entity.RoleEntity> findByRoleName(String roleName);

    Optional<RoleEntity> findByRoleNameAndIsDeletedFalse(String roleName);


}
