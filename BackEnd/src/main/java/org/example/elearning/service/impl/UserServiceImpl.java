package org.example.elearning.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.elearning.constant.PredefinedRole;
import org.example.elearning.dto.request.ChangePasswordRequest;
import org.example.elearning.dto.request.UpdateProfileRequest;
import org.example.elearning.dto.request.UserCreateRequest;
import org.example.elearning.dto.request.UserUpdateRequest;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.dto.response.UserResponse;
import org.example.elearning.entity.RoleEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.enums.UserStatus;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.*;
import org.example.elearning.mapper.InstructorMapper;
import org.example.elearning.mapper.UserMapper;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.PasswordResetService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.RoleService;
import org.example.elearning.specification.UserSpecification;
import org.example.elearning.utils.CloudinaryUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    UserMapper userMapper;
    UserRepository userRepository;
    RoleService roleService;
    InstructorRepository instructorRepository;
    PasswordEncoder passwordEncoder;
    CloudinaryUtil cloudinaryUtil;
    PasswordResetService passwordResetService;
    private final InstructorMapper instructorMapper;

    // ========================================
    // INTERNAL/HELPER METHODS
    // ========================================

    @Override
    public UserEntity getUserByIdEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }

    @Override
    public UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.USER_NOT_FOUND.getMessage()));
    }

    @Override
    public UserEntity getActiveUser(String email) {
        UserEntity userEntity = userRepository.findByEmail(email)
                .orElseThrow(() -> new UnauthorizedException(ErrorCode.INVALID_CREDENTIALS.getMessage()));
        
        if (!userEntity.getStatus().equals(UserStatus.ACTIVE)) {
            throw new ForbiddenException(ErrorCode.USER_LOCKED.getMessage());
        }
        
        if (userEntity.isDeleted()) {
            throw new ResourceNotFoundException(ErrorCode.USER_DELETED.getMessage());
        }
        
        return userEntity;
    }

    @Override
    public UserEntity getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getUserByEmail(email);
    }

    // ========================================
    // USER SELF-SERVICE OPERATIONS
    // ========================================

    @Override
    @Transactional
    public UserResponse getMyProfile() {
        UserEntity currentUser = getCurrentUser();
        UserResponse dto = userMapper.toEntityDTO(currentUser);
        enrichInstructorInfo(currentUser, dto);
        return dto;
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        UserEntity currentUser = getCurrentUser();
        
        userMapper.updateEntity(currentUser, request);
        UserEntity updated = userRepository.save(currentUser);
        
        log.info("User {} updated their profile", currentUser.getEmail());
        return userMapper.toEntityDTO(updated);
    }

    @Override
    @Transactional
    public void changeMyPassword(ChangePasswordRequest request) {
        UserEntity currentUser = getCurrentUser();

        if (!passwordEncoder.matches(request.getCurrentPassword(), currentUser.getPasswordHash())) {
            throw new BadRequestException(ErrorCode.INVALID_PASSWORD.getMessage());
        }

        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException(ErrorCode.PASSWORD_MISMATCH.getMessage());
        }

        currentUser.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(currentUser);
        
        log.info("User {} changed their password", currentUser.getEmail());
    }

    @Override
    @Transactional
    public UserResponse uploadMyAvatar(MultipartFile file) {
        validateImageFile(file);
        
        UserEntity currentUser = getCurrentUser();
        
        deleteAvatarFromCloud(currentUser.getAvatarUrl());
        
        try {
            String avatarUrl = cloudinaryUtil.uploadImage(file);
            currentUser.setAvatarUrl(avatarUrl);
            UserEntity updated = userRepository.save(currentUser);
            
            log.info("User {} uploaded new avatar", currentUser.getEmail());
            return userMapper.toEntityDTO(updated);
        } catch (IOException e) {
            log.error("Failed to upload avatar for user {}", currentUser.getEmail(), e);
            throw new InternalServerException(ErrorCode.CLOUDINARY_UPLOAD_FAILED.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteMyAvatar() {
        UserEntity currentUser = getCurrentUser();

        if (currentUser.getAvatarUrl() == null || currentUser.getAvatarUrl().isEmpty()) {
            throw new BadRequestException(ErrorCode.USER_NO_AVATAR.getMessage());
        }

        deleteAvatarFromCloud(currentUser.getAvatarUrl());

        currentUser.setAvatarUrl(null);
        userRepository.save(currentUser);
        
        log.info("User {} deleted their avatar", currentUser.getEmail());
    }

    // ========================================
    // ADMIN OPERATIONS - USER MANAGEMENT
    // ========================================

    @Override
    @Transactional
    public UserResponse createUser(UserCreateRequest userRequest) {
        UserEntity user = getUserByEmail(userRequest.getEmail());

        if(user != null){
            throw new ResourceConflictException(ErrorCode.USER_ALREADY_EXISTS.getMessage());
        }

        UserEntity newUser = userMapper.toEntity(userRequest);

        RoleEntity studentRole = roleService.findByRoleName(PredefinedRole.ROLE_STUDENT);
        newUser.setRoles(Set.of(studentRole));

        newUser.setStatus(UserStatus.ACTIVE);
        
        UserEntity savedUser = userRepository.save(newUser);
        
        passwordResetService.createActivationToken(savedUser.getUserId());

        log.info("Admin created new user: {}", savedUser.getEmail());
        return userMapper.toEntityDTO(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUserById(Long userId, UserUpdateRequest request) {
        UserEntity user = getUserByIdEntity(userId);

        String oldAvatarUrl = user.getAvatarUrl();

        String newAvatarUrl = request.getAvatarUrl();

        userMapper.updateEntity(user, request);

        if (newAvatarUrl != null && oldAvatarUrl != null
                && !oldAvatarUrl.isEmpty() && !oldAvatarUrl.equals(newAvatarUrl)) {
            deleteAvatarFromCloud(oldAvatarUrl);
        }

        UserEntity updated = userRepository.save(user);
        log.info("Admin updated user {}", userId);
        
        return userMapper.toEntityDTO(updated);
    }

    @Override
    @Transactional
    public UserResponse getUserById(Long userId) {
        UserEntity user = getUserByIdEntity(userId);
        UserResponse dto = userMapper.toEntityDTO(user);
        enrichInstructorInfo(user, dto);
        return dto;
    }

    @Override
    @Transactional
    public PaginatedResponse<UserResponse> getAllUsers(Pageable pageable, String search, UserStatus userStatus, Boolean deleted) {
        Specification<UserEntity> spec = Specification.allOf();

        if (userStatus != null) {
            spec = spec.and(UserSpecification.filterByStatus(userStatus));
        }

        spec = spec.and(deleted != null
                ? UserSpecification.filterByDeleted(deleted)
                : UserSpecification.notDeleted());

        if (search != null && !search.trim().isEmpty()) {
            spec = spec.and(UserSpecification.filterByKeyword(search.trim()));
        }

        Page<UserEntity> userPage = userRepository.findAll(spec, pageable);

        List<UserResponse> userResponses = userPage.getContent().stream()
                .map(user -> {
                    UserResponse dto = userMapper.toEntityDTO(user);
                    enrichInstructorInfo(user, dto);
                    return dto;
                })
                .collect(Collectors.toList());

        return new PaginatedResponse<>(userResponses, new PaginatedResponse.Pagination(
                userPage.getNumber() + 1,
                userPage.getSize(),
                userPage.getTotalElements(),
                userPage.getTotalPages()));
    }

    @Override
    @Transactional
    public void deleteUser(Long userId) {
        UserEntity user = getUserByIdEntity(userId);
        
        validateNotAdminUser(user);
        
        user.setStatus(UserStatus.LOCKED);
        user.setDeleted(true);
        userRepository.save(user);
        
        log.info("Admin soft-deleted user {}", userId);
    }

    @Override
    @Transactional
    public void restoreUser(Long userId) {
        UserEntity user = getUserByIdEntity(userId);

        user.setDeleted(false);

        userRepository.save(user);
        
        log.info("Admin restored user {}", userId);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long userId) {
        UserEntity user = getUserByIdEntity(userId);
        
        validateNotAdminUser(user);

        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.LOCKED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        UserEntity updated = userRepository.save(user);
        log.info("Admin toggled status for user {}: {}", userId, updated.getStatus());
        
        return userMapper.toEntityDTO(updated);
    }

    @Override
    @Transactional
    public UserResponse assignRolesToUser(Long userId, List<String> roleNames) {
        UserEntity user = getUserByIdEntity(userId);
        
        validateNotAdminUser(user);

        Set<RoleEntity> roles = roleNames.stream()
                .map(roleService::findByRoleName)
                .collect(Collectors.toSet());

        user.setRoles(roles);
        UserEntity updated = userRepository.save(user);
        
        log.info("Admin assigned roles {} to user {}", roleNames, userId);
        return userMapper.toEntityDTO(updated);
    }

    @Override
    @Transactional
    public String resetUserPassword(Long userId) {
        UserEntity user = getUserByIdEntity(userId);
        
        validateNotAdminUser(user);

        String newPassword = generateRandomPassword(12);

        user.setPasswordHash(passwordEncoder.encode(newPassword));

        userRepository.save(user);

        log.info("Admin reset password for user {}", userId);
        return newPassword;
    }

    @Override
    @Transactional
    public UserResponse uploadAvatarForUser(Long userId, MultipartFile file) {
        validateImageFile(file);
        
        UserEntity user = getUserByIdEntity(userId);
        
        deleteAvatarFromCloud(user.getAvatarUrl());
        
        // Upload new avatar
        try {
            String avatarUrl = cloudinaryUtil.uploadImage(file);
            user.setAvatarUrl(avatarUrl);
            UserEntity updated = userRepository.save(user);
            
            log.info("Admin uploaded avatar for user {}", userId);
            return userMapper.toEntityDTO(updated);
        } catch (IOException e) {
            log.error("Failed to upload avatar for user {}", userId, e);
            throw new InternalServerException(ErrorCode.CLOUDINARY_UPLOAD_FAILED.getMessage());
        }
    }


    @Override
    @Transactional
    public void importUsersFromExcel(MultipartFile file) throws IOException {
        List<UserEntity> users = new java.util.ArrayList<>();
        
        try (java.io.InputStream inputStream = file.getInputStream()) {
             Workbook workbook = WorkbookFactory.create(inputStream);
             Sheet sheet = workbook.getSheetAt(0);
             
             for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                Row row = sheet.getRow(i);
                if (row == null) continue;
                
                String email = getCellValueAsString(row.getCell(0));
                
                // Skip if email empty or exists
                if (email == null || email.trim().isEmpty()) continue;
                if (userRepository.findByEmail(email).isPresent()) continue;

                UserEntity user = new UserEntity();
                user.setEmail(email.trim());
                
                String rawPassword = getCellValueAsString(row.getCell(1));
                if (rawPassword.isEmpty()) rawPassword = "password123";
                user.setPasswordHash(passwordEncoder.encode(rawPassword));
                
                user.setFullName(getCellValueAsString(row.getCell(2)));
                user.setPhone(getCellValueAsString(row.getCell(4)));
                
                String roleName = getCellValueAsString(row.getCell(5));
                if (roleName.isEmpty()) roleName = "STUDENT";
                else {
                    roleName = roleName.toUpperCase();
                    if (!roleName.startsWith("ROLE_")) roleName = "ROLE_" + roleName;
                }
                
                try {
                    RoleEntity role = roleService.findByRoleName(roleName);
                    user.setRoles(Set.of(role));
                } catch (Exception e) {
                    RoleEntity role = roleService.findByRoleName(PredefinedRole.ROLE_STUDENT);
                    user.setRoles(Set.of(role));
                }
                
                user.setStatus(UserStatus.ACTIVE);
                user.setDeleted(false);
                
                users.add(user);
             }
        }
        
        if (!users.isEmpty()) {
            userRepository.saveAll(users);
            log.info("Admin imported {} users from Excel", users.size());
        }
    }

    @Override
    @Transactional
    public byte[] exportUsersToExcel() throws IOException {
        List<UserEntity> users = userRepository.findAll();
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Users");
            
            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row
            String[] columns = {"ID", "Họ tên", "Email", "Role", "Trạng thái", "Ngày tạo"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data
            int rowIdx = 1;
            for (UserEntity user : users) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(user.getUserId());
                row.createCell(1).setCellValue(user.getFullName());
                row.createCell(2).setCellValue(user.getEmail());
                row.createCell(3).setCellValue(user.getRoles().stream()
                    .map(RoleEntity::getRoleName)
                    .collect(Collectors.joining(", ")));
                row.createCell(4).setCellValue(user.getStatus().toString());
                row.createCell(5).setCellValue(user.getCreatedAt() != null ? user.getCreatedAt().toString() : "");
            }
            
            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            log.info("Admin exported {} users to Excel", users.size());
            return out.toByteArray();
        }
    }

    @Override
    @Transactional
    public List<UserEntity> findAllAdmins() {
        return userRepository.findAllAdmins();
    }


    private void validateNotAdminUser(UserEntity user) {
        boolean isAdmin = user.getRoles().stream()
                .anyMatch(role -> PredefinedRole.ROLE_ADMIN.equals(role.getRoleName()));
        
        if (isAdmin) {
            throw new ForbiddenException(ErrorCode.ADMIN_ACCOUNT_CANNOT_MODIFY.getMessage());
        }
    }


    private void enrichInstructorInfo(UserEntity user, UserResponse dto) {
        boolean isInstructor = user.getRoles().stream()
                .anyMatch(role -> PredefinedRole.ROLE_INSTRUCTOR.equals(role.getRoleName()));

        if (!isInstructor) {
            return;
        }

        instructorRepository.findByUser(user).ifPresent(instructor -> {
            instructorMapper.toUserResponse(dto, instructor);
        });
    }


    private String generateRandomPassword(int length) {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%";
        SecureRandom random = new SecureRandom();
        StringBuilder password = new StringBuilder(length);

        for (int i = 0; i < length; i++) {
            password.append(chars.charAt(random.nextInt(chars.length())));
        }

        return password.toString();
    }


    private void deleteAvatarFromCloud(String avatarUrl) {
        if (avatarUrl != null && !avatarUrl.isEmpty()) {
            try {
                cloudinaryUtil.deleteImageByUrl(avatarUrl);
            } catch (Exception e) {
                log.warn("Failed to delete avatar from cloud: {}", avatarUrl, e);
            }
        }
    }


    private void validateImageFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(ErrorCode.INVALID_FILE.getMessage());
        }
        
        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BadRequestException("File size must be less than 5MB");
        }
        
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BadRequestException("File must be an image");
        }
    }

    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> String.valueOf((long)cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
        } catch (Exception e) { 
            return ""; 
        }
    }
}
