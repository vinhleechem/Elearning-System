package org.example.elearning.config;


import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.constant.SecurityConstant;
import org.example.elearning.entity.PermissionEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.repository.PermissionRepository;
import org.example.elearning.repository.RoleRepository;
import org.example.elearning.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.util.*;

//import static jdk.nio.zipfs.ZipFileAttributeView.AttrID.permissions;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(1)
public class ApplicationInitConfig {
    UserRepository userRepository;
    RoleRepository roleRepository;
    PermissionRepository permissionRepository;
    PasswordEncoder passwordEncoder;
    @Bean
    ApplicationRunner applicationRunner() {
        return args -> {
            List<String> permissionNames = Arrays.asList(
                    SecurityConstant.VIEW_USER,
                    SecurityConstant.ADD_USER,
                    SecurityConstant.UPDATE_USER,
                    SecurityConstant.DELETE_USER,
// Permission
                    SecurityConstant.VIEW_PERMISSION,
                    SecurityConstant.ADD_PERMISSION,
                    SecurityConstant.UPDATE_PERMISSION,
                    SecurityConstant.DELETE_PERMISSION,
// Role
                    SecurityConstant.VIEW_ROLE,
                    SecurityConstant.ADD_ROLE,
                    SecurityConstant.UPDATE_ROLE,
                    SecurityConstant.DELETE_ROLE


            );

            Map<String, PermissionEntity> permissions = new HashMap<>();
            for (String name : permissionNames) {
                if (permissionRepository.findByPermissionName(name).isEmpty()) {
                    PermissionEntity permission = permissionRepository.save(
                            PermissionEntity.builder()
                                    .permissionName(name)
                                    .build()
                    );
                    permissions.put(name, permission);
                }
            }

            // Initialize roles and assign permissions
            if (roleRepository.findByRoleName(PredefinedRole.ROLE_ADMIN).isEmpty()) {
                log.info(permissions.values().toString());
                RoleEntity adminRole = RoleEntity.builder()
                        .roleName(PredefinedRole.ROLE_ADMIN)
                        .permissions(new HashSet<>(permissions.values()))
                        .build();
                roleRepository.save(adminRole);
                UserEntity adminAccount = UserEntity.builder()
                            .email("admin@admin.com")
                        .fullName("Admin User")
                        .status(UserStatus.ACTIVE)
                        .avatarUrl("https://vi.wikipedia.org/wiki/Cristiano_Ronaldo")
                        .roles(Set.of(adminRole))
                        .passwordHash(passwordEncoder.encode("admin"))
                        .build();
                userRepository.save(adminAccount);
            }

            if (roleRepository.findByRoleName(PredefinedRole.ROLE_STUDENT).isEmpty()) {
//                Set<PermissionEntity> studentPermissions = new HashSet<>();
//                List<String> studentPermissionNames = Arrays.asList(
//                        "XEM DANH SÁCH PHIM", "THÊM PHIM", "CẬP NHẬT PHIM", "XÓA PHIM",
//                        "XEM DANH SÁCH KHUYẾN MÃI", "THÊM KHUYẾN MÃI", "CẬP NHẬT KHUYẾN MÃI", "XÓA KHUYẾN MÃI",
//                        "XEM DANH SÁCH NHÂN VIÊN", "CẬP NHẬT NHÂN VIÊN", "THÊM NHÂN VIÊN",
//                        "XEM DANH SÁCH NGƯỜI DÙNG", "CẬP NHẬT NGƯỜI DÙNG",
//                        "XEM DANH SÁCH SUẤT CHIẾU", "THÊM SUẤT CHIẾU", "CẬP NHẬT SUẤT CHIẾU", "XÓA SUẤT CHIẾU", "GÁN KHUYẾN MÃI CHO KHÁCH HÀNG"
//                );
//                for (String name : studentPermissionNames) {
//                    managerPermissions.add(permissions.get(name));
//                }
                RoleEntity studentRole = RoleEntity.builder()
                        .roleName(PredefinedRole.ROLE_STUDENT)
//                        .permissions(studentPermissions)
                        .build();
                roleRepository.save(studentRole);
                UserEntity studentAccount = UserEntity.builder()
                        .email("student@student.com")
                        .fullName("Student User")
                        .status(UserStatus.ACTIVE)
                        .avatarUrl("https://example.com/student-avatar.png")
                        .roles(Set.of(studentRole))
                        .passwordHash(passwordEncoder.encode("student"))
                        .build();
                userRepository.save(studentAccount);
            }

            if (roleRepository.findByRoleName(PredefinedRole.ROLE_LECTURER).isEmpty()) {
//                Set<PermissionEntity> lecturerPermissions = new HashSet<>();
//                List<String> lecturerPermissionNames = Arrays.asList(
//                        "XEM DANH SÁCH PHIM",
//                        "XEM DANH SÁCH KHUYẾN MÃI",
//                        "XEM DANH SÁCH NGƯỜI DÙNG", "CẬP NHẬT NGƯỜI DÙNG",
//                        "XEM DANH SÁCH SUẤT CHIẾU"
//                );
//                for (String name : lecturerPermissionNames) {
//                    lecturerPermissions.add(permissions.get(name));
//                }
                RoleEntity lecturerRole = RoleEntity.builder()
                        .roleName(PredefinedRole.ROLE_LECTURER)
//                        .permissions(lecturerPermissions)
                        .build();
                roleRepository.save(lecturerRole);
                UserEntity lecturerAccount = UserEntity.builder()
                        .email("lecturer@lecturer.com")
                        .fullName("Lecturer User")
                        .status(UserStatus.ACTIVE)
                        .avatarUrl("https://example.com/lecturer-avatar.png")
                        .roles(Set.of(lecturerRole))
                        .passwordHash(passwordEncoder.encode("lecturer"))
                        .build();
                userRepository.save(lecturerAccount);
            }


        };
    }
}
