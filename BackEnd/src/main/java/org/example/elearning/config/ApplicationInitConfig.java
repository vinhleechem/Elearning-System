package org.example.elearning.config;

import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.constant.SecurityConstant;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.PermissionEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.PermissionRepository;
import org.example.elearning.repository.RoleRepository;
import org.example.elearning.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Configuration
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@Order(1)
public class ApplicationInitConfig {
        UserRepository userRepository;
        RoleRepository roleRepository;
        PermissionRepository permissionRepository;
        InstructorRepository instructorRepository;
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
                                                                        .build());
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
                                RoleEntity studentRole = RoleEntity.builder()
                                                .roleName(PredefinedRole.ROLE_STUDENT)
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

                        if (roleRepository.findByRoleName(PredefinedRole.ROLE_INSTRUCTOR).isEmpty()) {
                                RoleEntity lecturerRole = RoleEntity.builder()
                                                .roleName(PredefinedRole.ROLE_INSTRUCTOR)
                                                .build();
                                roleRepository.save(lecturerRole);

                                // Create multiple fake instructor user accounts
                                List<UserEntity> instructorUsers = Arrays.asList(
                                                UserEntity.builder()
                                                                .email("nguyen.van.a@instructor.com")
                                                                .fullName("Nguyễn Văn A")
                                                                .status(UserStatus.ACTIVE)
                                                                .avatarUrl("https://i.pravatar.cc/150?img=12")
                                                                .roles(Set.of(lecturerRole))
                                                                .passwordHash(passwordEncoder.encode("instructor123"))
                                                                .build(),
                                                UserEntity.builder()
                                                                .email("tran.thi.b@instructor.com")
                                                                .fullName("Trần Thị B")
                                                                .status(UserStatus.ACTIVE)
                                                                .avatarUrl("https://i.pravatar.cc/150?img=47")
                                                                .roles(Set.of(lecturerRole))
                                                                .passwordHash(passwordEncoder.encode("instructor123"))
                                                                .build(),
                                                UserEntity.builder()
                                                                .email("le.minh.c@instructor.com")
                                                                .fullName("Lê Minh C")
                                                                .status(UserStatus.ACTIVE)
                                                                .avatarUrl("https://i.pravatar.cc/150?img=33")
                                                                .roles(Set.of(lecturerRole))
                                                                .passwordHash(passwordEncoder.encode("instructor123"))
                                                                .build(),
                                                UserEntity.builder()
                                                                .email("pham.thu.d@instructor.com")
                                                                .fullName("Phạm Thu D")
                                                                .status(UserStatus.ACTIVE)
                                                                .avatarUrl("https://i.pravatar.cc/150?img=26")
                                                                .roles(Set.of(lecturerRole))
                                                                .passwordHash(passwordEncoder.encode("instructor123"))
                                                                .build(),
                                                UserEntity.builder()
                                                                .email("hoang.van.e@instructor.com")
                                                                .fullName("Hoàng Văn E")
                                                                .status(UserStatus.ACTIVE)
                                                                .avatarUrl("https://i.pravatar.cc/150?img=68")
                                                                .roles(Set.of(lecturerRole))
                                                                .passwordHash(passwordEncoder.encode("instructor123"))
                                                                .build());

                                // Save instructor users
                                List<UserEntity> savedInstructorUsers = userRepository.saveAll(instructorUsers);
                                log.info("Created {} instructor user accounts", savedInstructorUsers.size());

                                // Create instructor profile data for each instructor user
                                List<InstructorEntity> instructorProfiles = Arrays.asList(
                                                InstructorEntity.builder()
                                                                .user(savedInstructorUsers.get(0))
                                                                .headline("Senior Java Developer & Spring Boot Expert")
                                                                .biography("Với hơn 10 năm kinh nghiệm trong phát triển ứng dụng Java, tôi chuyên về Spring Framework, Microservices và Cloud Architecture. Đã đào tạo hơn 5000 học viên thành công.")
                                                                .website("https://nguyenvana.dev")
                                                                .linkedin("https://linkedin.com/in/nguyenvana")
                                                                .twitter("https://twitter.com/nguyenvana")
                                                                .youtube("https://youtube.com/@nguyenvana")
                                                                .totalStudents(5234)
                                                                .totalCourses(12)
                                                                .build(),
                                                InstructorEntity.builder()
                                                                .user(savedInstructorUsers.get(1))
                                                                .headline("Full-Stack Developer & UI/UX Specialist")
                                                                .biography("Chuyên gia về React, Angular và Vue.js với 8 năm kinh nghiệm. Đam mê tạo ra những giao diện người dùng đẹp mắt và trải nghiệm người dùng tuyệt vời.")
                                                                .website("https://tranthib.com")
                                                                .linkedin("https://linkedin.com/in/tranthib")
                                                                .twitter("https://twitter.com/tranthib")
                                                                .youtube("https://youtube.com/@tranthib")
                                                                .totalStudents(3890)
                                                                .totalCourses(8)
                                                                .build(),
                                                InstructorEntity.builder()
                                                                .user(savedInstructorUsers.get(2))
                                                                .headline("DevOps Engineer & Cloud Architect")
                                                                .biography("Chuyên về Docker, Kubernetes, AWS và Azure. Giúp các doanh nghiệp chuyển đổi sang Cloud và triển khai CI/CD hiệu quả.")
                                                                .website("https://leminhc.tech")
                                                                .linkedin("https://linkedin.com/in/leminhc")
                                                                .twitter("https://twitter.com/leminhc")
                                                                .youtube("https://youtube.com/@leminhc")
                                                                .totalStudents(2567)
                                                                .totalCourses(6)
                                                                .build(),
                                                InstructorEntity.builder()
                                                                .user(savedInstructorUsers.get(3))
                                                                .headline("Data Science & Machine Learning Expert")
                                                                .biography("Tiến sĩ về Machine Learning với 12 năm nghiên cứu và giảng dạy. Chuyên về Deep Learning, NLP và Computer Vision.")
                                                                .website("https://phamthud.ai")
                                                                .linkedin("https://linkedin.com/in/phamthud")
                                                                .twitter("https://twitter.com/phamthud")
                                                                .youtube("https://youtube.com/@phamthud")
                                                                .totalStudents(4123)
                                                                .totalCourses(10)
                                                                .build(),
                                                InstructorEntity.builder()
                                                                .user(savedInstructorUsers.get(4))
                                                                .headline("Mobile App Developer - iOS & Android")
                                                                .biography("Chuyên gia phát triển ứng dụng di động với Flutter, React Native và Swift. Đã phát triển hơn 50 ứng dụng thành công trên App Store và Google Play.")
                                                                .website("https://hoangvane.mobile")
                                                                .linkedin("https://linkedin.com/in/hoangvane")
                                                                .twitter("https://twitter.com/hoangvane")
                                                                .youtube("https://youtube.com/@hoangvane")
                                                                .totalStudents(3456)
                                                                .totalCourses(9)
                                                                .build());

                                // Save instructor profiles
                                instructorRepository.saveAll(instructorProfiles);
                                log.info("Created {} instructor profiles", instructorProfiles.size());
                        }

                };
        }
}
