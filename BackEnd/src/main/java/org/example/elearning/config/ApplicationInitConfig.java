package org.example.elearning.config;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.constant.SecurityConstant;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.InstructorEntity;
import org.example.elearning.entity.PermissionEntity;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.PermissionRepository;
import org.example.elearning.repository.RoleRepository;
import org.example.elearning.repository.UserRepository;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;

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
        CategoryRepository categoryRepository;
        CourseRepository courseRepository;
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

                        // Initialize categories if not exists
                        List<CategoryEntity> rootCategories = Arrays.asList(
                                        CategoryEntity.builder()
                                                        .name("Lập trình")
                                                        .slug("lap-trinh")
                                                        .level(1)
                                                        .isActive(true)
                                                        .build(),
                                        CategoryEntity.builder()
                                                        .name("Web Development")
                                                        .slug("web-development")
                                                        .level(1)
                                                        .isActive(true)
                                                        .build(),
                                        CategoryEntity.builder()
                                                        .name("Mobile Development")
                                                        .slug("mobile-development")
                                                        .level(1)
                                                        .isActive(true)
                                                        .build(),
                                        CategoryEntity.builder()
                                                        .name("Data Science & AI")
                                                        .slug("data-science-ai")
                                                        .level(1)
                                                        .isActive(true)
                                                        .build(),
                                        CategoryEntity.builder()
                                                        .name("DevOps & Cloud")
                                                        .slug("devops-cloud")
                                                        .level(1)
                                                        .isActive(true)
                                                        .build());

                        List<CategoryEntity> savedRootCategories = new java.util.ArrayList<>();
                        for (CategoryEntity category : rootCategories) {
                                if (categoryRepository.findBySlug(category.getSlug()).isEmpty()) {
                                        savedRootCategories.add(categoryRepository.save(category));
                                } else {
                                        savedRootCategories.add(categoryRepository.findBySlug(category.getSlug()).get());
                                }
                        }

                        // Create subcategories for better testing
                        if (savedRootCategories.size() >= 5) {
                                CategoryEntity lapTrinhCat = savedRootCategories.get(0);
                                CategoryEntity webDevCat = savedRootCategories.get(1);
                                CategoryEntity mobileDevCat = savedRootCategories.get(2);
                                CategoryEntity dsAiCat = savedRootCategories.get(3);
                                CategoryEntity devopsCat = savedRootCategories.get(4);

                                // Subcategories for "Lập trình"
                                List<CategoryEntity> lapTrinhSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Java")
                                                                .slug("java")
                                                                .parent(lapTrinhCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Python")
                                                                .slug("python")
                                                                .parent(lapTrinhCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("C++/C#")
                                                                .slug("cpp-csharp")
                                                                .parent(lapTrinhCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("JavaScript/TypeScript")
                                                                .slug("javascript-typescript")
                                                                .parent(lapTrinhCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build());

                                // Subcategories for "Web Development"
                                List<CategoryEntity> webDevSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Frontend")
                                                                .slug("frontend")
                                                                .parent(webDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Backend")
                                                                .slug("backend")
                                                                .parent(webDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Full-Stack")
                                                                .slug("full-stack")
                                                                .parent(webDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build());

                                // Subcategories for "Mobile Development"
                                List<CategoryEntity> mobileDevSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("iOS")
                                                                .slug("ios")
                                                                .parent(mobileDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Android")
                                                                .slug("android")
                                                                .parent(mobileDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("React Native & Flutter")
                                                                .slug("react-native-flutter")
                                                                .parent(mobileDevCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build());

                                // Subcategories for "Data Science & AI"
                                List<CategoryEntity> dsAiSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Machine Learning")
                                                                .slug("machine-learning")
                                                                .parent(dsAiCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Deep Learning")
                                                                .slug("deep-learning")
                                                                .parent(dsAiCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Data Analysis")
                                                                .slug("data-analysis")
                                                                .parent(dsAiCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build());

                                // Subcategories for "DevOps & Cloud"
                                List<CategoryEntity> devopsSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Docker & Kubernetes")
                                                                .slug("docker-kubernetes")
                                                                .parent(devopsCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("AWS")
                                                                .slug("aws")
                                                                .parent(devopsCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Azure & GCP")
                                                                .slug("azure-gcp")
                                                                .parent(devopsCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("CI/CD Pipeline")
                                                                .slug("cicd-pipeline")
                                                                .parent(devopsCat)
                                                                .level(2)
                                                                .isActive(true)
                                                                .build());

                                // Save all subcategories (check duplicate first)
                                for (CategoryEntity subcat : lapTrinhSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : webDevSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : mobileDevSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : dsAiSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : devopsSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }

                                // Create 3rd level subcategories (nested deeper for testing)
                                // Get Java parent from DB (must exist after save above)
                                CategoryEntity javaParent = categoryRepository.findBySlug("java")
                                        .orElseThrow(() -> new RuntimeException("Java category not found"));
                                List<CategoryEntity> javaSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Spring Boot")
                                                                .slug("spring-boot")
                                                                .parent(javaParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Hibernate & JPA")
                                                                .slug("hibernate-jpa")
                                                                .parent(javaParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Microservices")
                                                                .slug("java-microservices")
                                                                .parent(javaParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build());

                                // Get Frontend parent from DB
                                CategoryEntity frontendParent = categoryRepository.findBySlug("frontend")
                                        .orElseThrow(() -> new RuntimeException("Frontend category not found"));
                                List<CategoryEntity> frontendSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("React.js")
                                                                .slug("reactjs")
                                                                .parent(frontendParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Vue.js")
                                                                .slug("vuejs")
                                                                .parent(frontendParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Angular")
                                                                .slug("angular")
                                                                .parent(frontendParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build());

                                // Get Machine Learning parent from DB
                                CategoryEntity mlParent = categoryRepository.findBySlug("machine-learning")
                                        .orElseThrow(() -> new RuntimeException("Machine Learning category not found"));
                                List<CategoryEntity> mlSubcats = Arrays.asList(
                                                CategoryEntity.builder()
                                                                .name("Supervised Learning")
                                                                .slug("supervised-learning")
                                                                .parent(mlParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Unsupervised Learning")
                                                                .slug("unsupervised-learning")
                                                                .parent(mlParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build(),
                                                CategoryEntity.builder()
                                                                .name("Reinforcement Learning")
                                                                .slug("reinforcement-learning")
                                                                .parent(mlParent)
                                                                .level(3)
                                                                .isActive(true)
                                                                .build());

                                // Save 3rd level subcategories (check duplicate first)
                                for (CategoryEntity subcat : javaSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : frontendSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }
                                for (CategoryEntity subcat : mlSubcats) {
                                    if (categoryRepository.findBySlug(subcat.getSlug()).isEmpty()) {
                                        categoryRepository.save(subcat);
                                    }
                                }

                                log.info("Initialized complete category hierarchy with {} root categories and nested subcategories", savedRootCategories.size());
                        }

                        List<CategoryEntity> savedCategories = categoryRepository.findAll();

                        // Initialize courses if not exists
                        initializeCourses(savedCategories);
                };

        }

        @Transactional
        private void initializeCourses(List<CategoryEntity> savedCategories) {
                List<InstructorEntity> allInstructors = instructorRepository.findAll();
                if (!allInstructors.isEmpty() && !savedCategories.isEmpty()) {
                        // Get specific categories by slug for accurate assignment
                        CategoryEntity springBootCat = categoryRepository.findBySlug("spring-boot").orElse(null);
                        CategoryEntity reactCat = categoryRepository.findBySlug("reactjs").orElse(null);
                        CategoryEntity pythonCat = categoryRepository.findBySlug("python").orElse(null);
                        CategoryEntity dockerCat = categoryRepository.findBySlug("docker-kubernetes").orElse(null);
                        CategoryEntity mlCat = categoryRepository.findBySlug("machine-learning").orElse(null);
                        CategoryEntity flutterCat = categoryRepository.findBySlug("react-native-flutter").orElse(null);

                        // Fallback to root categories if specific ones not found
                        if (springBootCat == null) springBootCat = savedCategories.get(0); // Lập trình
                        if (reactCat == null) reactCat = savedCategories.get(1); // Web Development
                        if (pythonCat == null) pythonCat = savedCategories.get(0); // Lập trình
                        if (dockerCat == null) dockerCat = savedCategories.get(4); // DevOps & Cloud
                        if (mlCat == null) mlCat = savedCategories.get(3); // Data Science & AI
                        if (flutterCat == null) flutterCat = savedCategories.get(2); // Mobile Development

                        List<CourseEntity> courses = Arrays.asList(
                                                CourseEntity.builder()
                                                                .instructor(allInstructors.get(0))
                                                                .category(springBootCat)
                                                                .title("Java Spring Boot - Xây Dựng RESTful API từ Cơ Bản đến Nâng Cao")
                                                                .slug("java-spring-boot-restful-api")
                                                                .shortDescription("Khóa học toàn diện về Spring Boot, từ cơ bản đến nâng cao, giúp bạn xây dựng RESTful API chuyên nghiệp")
                                                                .description("Khóa học này sẽ hướng dẫn bạn từng bước xây dựng một ứng dụng Spring Boot hoàn chỉnh. Bạn sẽ học cách tạo RESTful API, kết nối database, xử lý authentication, và deploy ứng dụng lên cloud.")
                                                                .whatYouLearn("• Hiểu rõ kiến trúc Spring Boot\n• Xây dựng RESTful API với Spring MVC\n• Kết nối và làm việc với Database\n• Xử lý Authentication và Authorization\n• Testing và Deploy ứng dụng")
                                                                .requirements("• Kiến thức cơ bản về Java\n• Hiểu biết về OOP\n• Có máy tính cài đặt JDK và IDE")
                                                                .targetAudience("• Lập trình viên Java muốn học Spring Boot\n• Developer muốn xây dựng Backend API\n• Sinh viên IT muốn nâng cao kỹ năng")
                                                                .thumbnailUrl("https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800")
                                                                .previewVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                                                                .level("intermediate")
                                                                .status(CourseStatus.PUBLISHED)
                                                                .price(new BigDecimal("599000"))
                                                                .discountPrice(new BigDecimal("399000"))
                                                                .language("Tiếng Việt")
                                                                .hasCertificate(true)
                                                                .totalDurationMinutes(1800)
                                                                .totalLectures(45)
                                                                .averageRating(new BigDecimal("4.8"))
                                                                .totalStudents(5234)
                                                                .totalReviews(1234)
                                                                .publishedAt(LocalDateTime.now().minusMonths(2))
                                                                .build(),
                                                CourseEntity.builder()
                                                                .instructor(allInstructors.get(1))
                                                                .category(reactCat)
                                                                .title("React.js - Xây Dựng Ứng Dụng Web Hiện Đại")
                                                                .slug("react-js-xay-dung-ung-dung-web")
                                                                .shortDescription("Học React.js từ đầu, xây dựng các ứng dụng web hiện đại với Hooks, Redux, và các công nghệ mới nhất")
                                                                .description("Khóa học React.js toàn diện giúp bạn nắm vững thư viện JavaScript phổ biến nhất hiện nay. Từ cơ bản đến nâng cao, bạn sẽ học cách xây dựng Single Page Application (SPA) chuyên nghiệp.")
                                                                .whatYouLearn("• Nắm vững React Hooks và Functional Components\n• Quản lý state với Redux và Context API\n• Routing với React Router\n• Tích hợp API và xử lý dữ liệu\n• Testing và tối ưu hiệu suất")
                                                                .requirements("• Kiến thức cơ bản về JavaScript\n• Hiểu biết về HTML/CSS\n• Có máy tính cài đặt Node.js")
                                                                .targetAudience("• Frontend Developer muốn học React\n• Web Developer muốn nâng cao kỹ năng\n• Sinh viên muốn xây dựng ứng dụng web")
                                                                .thumbnailUrl("https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800")
                                                                .previewVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                                                                .level("beginner")
                                                                .status(CourseStatus.PUBLISHED)
                                                                .price(new BigDecimal("499000"))
                                                                .discountPrice(new BigDecimal("299000"))
                                                                .language("Tiếng Việt")
                                                                .hasCertificate(true)
                                                                .totalDurationMinutes(1500)
                                                                .totalLectures(38)
                                                                .averageRating(new BigDecimal("4.7"))
                                                                .totalStudents(3890)
                                                                .totalReviews(890)
                                                                .publishedAt(LocalDateTime.now().minusMonths(1))
                                                                .build(),
                                                CourseEntity.builder()
                                                                .instructor(allInstructors.get(2))
                                                                .category(dockerCat)
                                                                .title("Docker & Kubernetes - Containerization và Orchestration")
                                                                .slug("docker-kubernetes-containerization")
                                                                .shortDescription("Học Docker và Kubernetes từ cơ bản, triển khai ứng dụng với container và quản lý cluster hiệu quả")
                                                                .description("Khóa học này sẽ giúp bạn nắm vững Docker và Kubernetes - hai công cụ quan trọng nhất trong DevOps. Bạn sẽ học cách containerize ứng dụng và quản lý chúng trên Kubernetes cluster.")
                                                                .whatYouLearn("• Containerization với Docker\n• Xây dựng và quản lý Docker Images\n• Kubernetes Architecture và Components\n• Deploy và Scale ứng dụng\n• CI/CD với Kubernetes")
                                                                .requirements("• Kiến thức cơ bản về Linux\n• Hiểu biết về hệ thống và mạng\n• Có máy tính cài đặt Docker Desktop")
                                                                .targetAudience("• DevOps Engineer\n• Backend Developer muốn học DevOps\n• System Administrator")
                                                                .thumbnailUrl("https://images.unsplash.com/photo-1605745341112-85968b19335b?w=800")
                                                                .previewVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                                                                .level("intermediate")
                                                                .status(CourseStatus.PUBLISHED)
                                                                .price(new BigDecimal("699000"))
                                                                .discountPrice(new BigDecimal("499000"))
                                                                .language("Tiếng Việt")
                                                                .hasCertificate(true)
                                                                .totalDurationMinutes(2100)
                                                                .totalLectures(52)
                                                                .averageRating(new BigDecimal("4.9"))
                                                                .totalStudents(2567)
                                                                .totalReviews(567)
                                                                .publishedAt(LocalDateTime.now().minusMonths(3))
                                                                .build(),
                                                CourseEntity.builder()
                                                                .instructor(allInstructors.get(3))
                                                                .category(mlCat)
                                                                .title("Machine Learning với Python - Từ Cơ Bản đến Nâng Cao")
                                                                .slug("machine-learning-python")
                                                                .shortDescription("Khóa học Machine Learning toàn diện với Python, từ thuật toán cơ bản đến Deep Learning")
                                                                .description("Khóa học Machine Learning này sẽ đưa bạn từ những khái niệm cơ bản đến các kỹ thuật nâng cao như Deep Learning, Neural Networks. Bạn sẽ học cách xây dựng và deploy các mô hình ML thực tế.")
                                                                .whatYouLearn("• Machine Learning Fundamentals\n• Supervised và Unsupervised Learning\n• Deep Learning với TensorFlow và PyTorch\n• Natural Language Processing\n• Computer Vision và Image Recognition")
                                                                .requirements("• Kiến thức cơ bản về Python\n• Hiểu biết về Toán học (Đại số, Giải tích)\n• Có máy tính cài đặt Python và Jupyter Notebook")
                                                                .targetAudience("• Data Scientist\n• AI Engineer\n• Developer muốn học Machine Learning")
                                                                .thumbnailUrl("https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800")
                                                                .previewVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                                                                .level("advanced")
                                                                .status(CourseStatus.PUBLISHED)
                                                                .price(new BigDecimal("799000"))
                                                                .discountPrice(new BigDecimal("599000"))
                                                                .language("Tiếng Việt")
                                                                .hasCertificate(true)
                                                                .totalDurationMinutes(2400)
                                                                .totalLectures(60)
                                                                .averageRating(new BigDecimal("4.8"))
                                                                .totalStudents(4123)
                                                                .totalReviews(923)
                                                                .publishedAt(LocalDateTime.now().minusMonths(4))
                                                                .build(),
                                                CourseEntity.builder()
                                                                .instructor(allInstructors.get(4))
                                                                .category(flutterCat)
                                                                .title("Flutter - Phát Triển Ứng Dụng Di Động Đa Nền Tảng")
                                                                .slug("flutter-phat-trien-ung-dung-di-dong")
                                                                .shortDescription("Học Flutter để xây dựng ứng dụng iOS và Android với một codebase duy nhất")
                                                                .description("Khóa học Flutter này sẽ hướng dẫn bạn xây dựng ứng dụng di động đẹp mắt và hiệu suất cao cho cả iOS và Android. Bạn sẽ học từ cơ bản đến nâng cao, bao gồm state management, API integration, và publish app.")
                                                                .whatYouLearn("• Flutter Widgets và UI Components\n• State Management với Provider và Bloc\n• Navigation và Routing\n• API Integration và Data Persistence\n• Publish App lên App Store và Google Play")
                                                                .requirements("• Kiến thức cơ bản về Dart hoặc OOP\n• Hiểu biết về Mobile App Development\n• Có máy tính cài đặt Flutter SDK")
                                                                .targetAudience("• Mobile Developer\n• Web Developer muốn học Mobile\n• Sinh viên muốn xây dựng ứng dụng di động")
                                                                .thumbnailUrl("https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800")
                                                                .previewVideoUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")
                                                                .level("beginner")
                                                                .status(CourseStatus.DRAFT)
                                                                .price(new BigDecimal("549000"))
                                                                .discountPrice(new BigDecimal("349000"))
                                                                .language("Tiếng Việt")
                                                                .hasCertificate(true)
                                                                .totalDurationMinutes(1650)
                                                                .totalLectures(42)
                                                                .averageRating(new BigDecimal("4.6"))
                                                                .totalStudents(3456)
                                                                .totalReviews(756)
                                                                .publishedAt(null)
                                                                .build());

                        for (CourseEntity course : courses) {
                                if (!courseRepository.existsBySlug(course.getSlug())) {
                                        courseRepository.save(course);
                                }
                        }
                        log.info("Initialized {} courses", courses.size());
                }
        }
}
