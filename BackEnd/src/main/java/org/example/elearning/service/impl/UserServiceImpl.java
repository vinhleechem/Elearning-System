package org.example.elearning.service.impl;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.SecureRandom;
import java.util.List;
import java.util.Set;
import java.util.UUID;
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
import org.example.elearning.mapper.UserMapper;
import org.example.elearning.repository.InstructorRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.PasswordResetService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.RoleService;
import org.example.elearning.specification.UserSpecification;
import org.example.elearning.util.CloudinaryUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

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


    @Override
    public UserEntity getCurrentUser() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        return getUserByEmail(email);
    }

    // ==================== User self-service APIs ====================
    @Override
    public UserResponse getMyInfo() {
        String name = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity userEntity = getUserByEmail(name);
        return userMapper.toEntityDTO(userEntity);
    }

    @Override
    @Transactional
    public UserResponse updateMyProfile(UpdateProfileRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        userMapper.updateEntity(user, request);

        return userMapper.toEntityDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public void changePassword(ChangePasswordRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        // Verify current password
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException(ErrorCode.INVALID_PASSWORD.getMessage());
        }

        // Verify new password and confirm password match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException(ErrorCode.PASSWORD_MISMATCH.getMessage());
        }

        // Update password
        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
    }

    @Override
    @Transactional
    public UserResponse uploadAvatar(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(ErrorCode.INVALID_FILE.getMessage());
        }

        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        // Xoá avatar cũ trên Cloudinary nếu có
        deleteOldAvatarIfExists(user);

        try {
            String imageUrl = cloudinaryUtil.uploadImage(file);
            user.setAvatarUrl(imageUrl);
            userRepository.save(user);
            return userMapper.toEntityDTO(user);
        } catch (IOException e) {
            throw new InternalServerException(ErrorCode.CLOUDINARY_UPLOAD_FAILED.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteAvatar() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        if (user.getAvatarUrl() == null || user.getAvatarUrl().isEmpty()) {
            throw new BadRequestException(ErrorCode.USER_NO_AVATAR.getMessage());
        }

        // Xoá file trên Cloudinary
        deleteOldAvatarIfExists(user);

        user.setAvatarUrl(null);
        userRepository.save(user);
    }

    // ==================== Admin APIs ====================
    @Override
    public PaginatedResponse<UserResponse> getAllUsers(Pageable pageable, String search) {
        var spec = UserSpecification.notDeleted();

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
    public UserResponse getUserById(Long id) {
        UserEntity user = getUserByIdEntity(id);
        UserResponse dto = userMapper.toEntityDTO(user);
        enrichInstructorInfo(user, dto);
        return dto;
    }

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
    @Transactional
    public UserResponse createUser(UserCreateRequest userRequest) {
        // Check if user already exists
        userRepository.findByEmail(userRequest.getEmail()).ifPresent(user -> {
            throw new ResourceConflictException(ErrorCode.USER_ALREADY_EXISTS.getMessage());
        });

        UserEntity newUser = userMapper.toEntity(userRequest);
        
        // If password is provided, encode it
        if (newUser.getPasswordHash() != null && !newUser.getPasswordHash().isEmpty()) {
            newUser.setPasswordHash(passwordEncoder.encode(newUser.getPasswordHash()));
        } else {
            // No password provided - set a temporary placeholder
            // User will set their own password via activation link
            newUser.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
        }
        
        if (newUser.getRoles() == null || newUser.getRoles().isEmpty()) {
            RoleEntity studentRole = roleService.findByRoleName(PredefinedRole.ROLE_STUDENT);
            newUser.setRoles(Set.of(studentRole));
        }
        
        newUser.setStatus(UserStatus.ACTIVE);
        
        UserEntity savedUser = userRepository.save(newUser);
        
        // Send activation email if password was not provided
        if (userRequest.getPasswordHash() == null || userRequest.getPasswordHash().isEmpty()) {
            passwordResetService.createActivationToken(savedUser.getUserId());
        }
        
        return userMapper.toEntityDTO(savedUser);
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, UserUpdateRequest userUpdateRequest) {
        UserEntity userEntity = getUserByIdEntity(id);

        // Nếu admin đổi avatarUrl và trước đó user đã có avatar → xoá ảnh cũ
        String oldAvatarUrl = userEntity.getAvatarUrl();
        String newAvatarUrl = userUpdateRequest.getAvatarUrl();

        userMapper.updateEntity(userEntity, userUpdateRequest);

        if (newAvatarUrl != null
                && oldAvatarUrl != null
                && !oldAvatarUrl.isEmpty()
                && !oldAvatarUrl.equals(newAvatarUrl)) {
            cloudinaryUtil.deleteImageByUrl(oldAvatarUrl);
        }

        return userMapper.toEntityDTO(userRepository.save(userEntity));
    }

    @Override
    @Transactional
    public UserResponse updateUserAvatar(Long id, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException(ErrorCode.INVALID_FILE.getMessage());
        }

        UserEntity user = getUserByIdEntity(id);

        // Xoá avatar cũ trên Cloudinary nếu có
        deleteOldAvatarIfExists(user);

        try {
            String imageUrl = cloudinaryUtil.uploadImage(file);
            user.setAvatarUrl(imageUrl);
            userRepository.save(user);
            return userMapper.toEntityDTO(user);
        } catch (IOException e) {
            throw new InternalServerException(ErrorCode.CLOUDINARY_UPLOAD_FAILED.getMessage());
        }
    }

    @Override
    @Transactional
    public void deleteUser(Long id) {
        UserEntity user = getUserByIdEntity(id);
        user.getRoles().forEach(this::handleAdminUser);
        user.setStatus(UserStatus.LOCKED);
        user.setDeleted(true);
        userRepository.save(user);
    }

    @Override
    @Transactional
    public void restoreUser(Long id) {
        UserEntity entity = getUserByIdEntity(id);
        entity.setDeleted(false);
        userRepository.save(entity);
    }

    @Override
    @Transactional
    public UserResponse toggleUserStatus(Long id) {
        UserEntity user = getUserByIdEntity(id);
        user.getRoles().forEach(this::handleAdminUser);

        if (user.getStatus() == UserStatus.ACTIVE) {
            user.setStatus(UserStatus.LOCKED);
        } else {
            user.setStatus(UserStatus.ACTIVE);
        }

        return userMapper.toEntityDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse assignRoles(Long id, List<String> roleNames) {
        UserEntity user = getUserByIdEntity(id);
        user.getRoles().forEach(this::handleAdminUser);

        Set<RoleEntity> roles = roleNames.stream()
                .map(roleService::findByRoleName)
                .collect(Collectors.toSet());

        user.setRoles(roles);
        return userMapper.toEntityDTO(userRepository.save(user));
    }

    @Override
    @Transactional
    public String resetPassword(Long id) {
        UserEntity user = getUserByIdEntity(id);
        user.getRoles().forEach(this::handleAdminUser);

        String newPassword = generateRandomPassword(8);
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        return newPassword;
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserEntity> findAllAdmins() {
        return userRepository.findAllAdmins();
    }

    // ==================== Helper methods ====================
    private void handleAdminUser(RoleEntity entity) {
        if (PredefinedRole.ROLE_ADMIN.equals(entity.getRoleName())) {
            throw new ForbiddenException(ErrorCode.ADMIN_ACCOUNT_CANNOT_MODIFY.getMessage());
        }
    }

    /**
     * Gắn thêm thông tin giảng viên vào UserResponse nếu user này là INSTRUCTOR.
     */
    private void enrichInstructorInfo(UserEntity user, UserResponse dto) {
        if (user.getRoles() == null) {
            return;
        }

        boolean isInstructor = user.getRoles().stream()
                .anyMatch(role -> PredefinedRole.ROLE_INSTRUCTOR.equals(role.getRoleName()));

        if (!isInstructor) {
            return;
        }

        instructorRepository.findByUser(user).ifPresent(instructor -> {
            dto.setInstructorId(instructor.getInstructorId());
            dto.setInstructorHeadline(instructor.getHeadline());
            dto.setInstructorBiography(instructor.getBiography());
            dto.setInstructorWebsite(instructor.getWebsite());
            dto.setInstructorLinkedin(instructor.getLinkedin());
            dto.setInstructorTwitter(instructor.getTwitter());
            dto.setInstructorYoutube(instructor.getYoutube());
            dto.setInstructorTotalStudents(instructor.getTotalStudents());
            dto.setInstructorTotalCourses(instructor.getTotalCourses());
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

   
    private void deleteOldAvatarIfExists(UserEntity user) {
        if (user.getAvatarUrl() != null && !user.getAvatarUrl().isEmpty()) {
            cloudinaryUtil.deleteImageByUrl(user.getAvatarUrl());
        }
    }

    @Override
    @Transactional
    public void importUsers(MultipartFile file) throws IOException {
        List<UserEntity> users = new java.util.ArrayList<>();
        
        try (java.io.InputStream inputStream = file.getInputStream()) {
             org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(inputStream);
             org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
             
             for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
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
        }
    }

    @Override
    public byte[] exportUsers() throws IOException {
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
            return out.toByteArray();
        }
    }

    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> String.valueOf((long)cell.getNumericCellValue());
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
        } catch (Exception e) { return ""; }
    }
}
