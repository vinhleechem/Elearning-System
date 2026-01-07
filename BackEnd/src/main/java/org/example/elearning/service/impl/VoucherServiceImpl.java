package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.example.elearning.dto.request.VoucherRequest;
import org.example.elearning.dto.response.UserVoucherResponse;
import org.example.elearning.dto.response.VoucherResponse;
import org.example.elearning.entity.*;
import org.example.elearning.enums.VoucherApplicability;
import org.example.elearning.enums.VoucherSource;
import org.example.elearning.enums.VoucherType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceConflictException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.VoucherMapper;
import org.example.elearning.repository.*;
import org.example.elearning.service.VoucherService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class VoucherServiceImpl implements VoucherService {

    private final VoucherRepository voucherRepository;
    private final UserVoucherRepository userVoucherRepository;
    private final UserRepository userRepository;
    private final InstructorRepository instructorRepository;
    private final CourseRepository courseRepository;
    private final VoucherMapper voucherMapper;

    @Override
    @Transactional
    public VoucherResponse createVoucher(VoucherRequest request, Long creatorId) {
        log.info("Creating new voucher: {}", request.getCode());

        // Check if code already exists
        if (voucherRepository.findByCodeAndIsDeletedFalse(request.getCode()).isPresent()) {
            throw new ResourceConflictException(ErrorCode.VOUCHER_ALREADY_EXISTS.getMessage());
        }

        // Create voucher entity using mapper
        VoucherEntity voucher = voucherMapper.toEntity(request);
        voucher.setUsedCount(0);
        voucher.setApplicableCourses(new ArrayList<>());

        // Set instructor if provided
        if (request.getInstructorId() != null) {
            InstructorEntity instructor = instructorRepository.findById(request.getInstructorId())
                    .orElseThrow(() -> new RuntimeException("Instructor not found"));
            voucher.setInstructor(instructor);
        }

        voucher = voucherRepository.save(voucher);

        // Add applicable courses if SPECIFIC_COURSES
        if (request.getApplicableTo() == VoucherApplicability.SPECIFIC_COURSES
                && request.getApplicableCourseIds() != null && !request.getApplicableCourseIds().isEmpty()) {
            List<CourseEntity> courses = courseRepository.findAllById(request.getApplicableCourseIds());
            voucher.getApplicableCourses().addAll(courses);
            voucher = voucherRepository.save(voucher);
        }

        log.info("Voucher created successfully: {}", voucher.getCode());
        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional
    public VoucherResponse updateVoucher(Long voucherId, VoucherRequest request) {
        log.info("Updating voucher ID: {}", voucherId);

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        // Update fields using mapper
        voucherMapper.updateEntity(voucher, request);

        // Update applicable courses
        voucher.getApplicableCourses().clear();
        if (request.getApplicableTo() == VoucherApplicability.SPECIFIC_COURSES
                && request.getApplicableCourseIds() != null && !request.getApplicableCourseIds().isEmpty()) {
            List<CourseEntity> courses = courseRepository.findAllById(request.getApplicableCourseIds());
            voucher.getApplicableCourses().addAll(courses);
        }

        voucher = voucherRepository.save(voucher);
        log.info("Voucher updated successfully");

        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public VoucherResponse getVoucherById(Long voucherId) {
        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        return voucherMapper.toResponse(voucher);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<VoucherResponse> getAllVouchers(Pageable pageable) {
        return voucherRepository.findAll(pageable)
                .map(voucherMapper::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VoucherResponse> getPublicVouchers() {
        LocalDateTime now = LocalDateTime.now();
        List<VoucherEntity> vouchers = voucherRepository.findAvailablePublicVouchers(now);

        return vouchers.stream()
                .map(voucherMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserVoucherResponse claimVoucher(String code, Long userId) {
        log.info("User {} claiming voucher: {}", userId, code);

        // Find voucher
        VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_CODE_NOT_FOUND.getMessage()));

        // Validate voucher
        validateVoucherForClaim(voucher, userId);

        // Find user
        UserEntity user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Create user voucher
        UserVoucherEntity userVoucher = UserVoucherEntity.builder()
                .user(user)
                .voucher(voucher)
                .source(VoucherSource.SYSTEM_GIFT)
                .isUsed(false)
                .build();

        userVoucher = userVoucherRepository.save(userVoucher);
        log.info("Voucher claimed successfully");

        return mapToUserVoucherResponse(userVoucher);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserVoucherResponse> getUserVouchers(Long userId, Boolean onlyAvailable) {
        List<UserVoucherEntity> userVouchers;

        if (onlyAvailable != null && onlyAvailable) {
            LocalDateTime now = LocalDateTime.now();
            userVouchers = userVoucherRepository.findAvailableVouchers(userId, now);
        } else {
            userVouchers = userVoucherRepository.findByUser_UserIdAndIsDeletedFalse(userId);
        }

        return userVouchers.stream()
                .map(this::mapToUserVoucherResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public boolean validateVoucherCode(String code, Long userId) {
        try {
            VoucherEntity voucher = voucherRepository.findByCodeAndIsDeletedFalse(code)
                    .orElse(null);

            if (voucher == null) {
                return false;
            }

            validateVoucherForClaim(voucher, userId);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    @Override
    @Transactional
    public void deleteVoucher(Long voucherId) {
        log.info("Deleting voucher ID: {}", voucherId);

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        voucher.setDeleted(true);
        voucherRepository.save(voucher);
        log.info("Voucher soft deleted successfully");
    }

    @Override
    @Transactional
    public void grantVoucherToUsers(Long voucherId, List<Long> userIds) {
        log.info("Granting voucher ID {} to {} users", voucherId, userIds.size());

        VoucherEntity voucher = voucherRepository.findById(voucherId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.VOUCHER_NOT_FOUND.getMessage()));

        List<UserEntity> users = userRepository.findAllById(userIds);

        for (UserEntity user : users) {
            // Check if user already has this voucher
            if (userVoucherRepository.findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(
                    user.getUserId(), voucherId).isEmpty()) {

                UserVoucherEntity userVoucher = UserVoucherEntity.builder()
                        .user(user)
                        .voucher(voucher)
                        .source(VoucherSource.ADMIN_GRANT)
                        .isUsed(false)
                        .build();

                userVoucherRepository.save(userVoucher);
            }
        }

        log.info("Voucher granted successfully");
    }

    // Validation methods
    private void validateVoucherForClaim(VoucherEntity voucher, Long userId) {
        LocalDateTime now = LocalDateTime.now();

        // Check if active
        if (!voucher.getIsActive()) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_ACTIVE.getMessage());
        }

        // Check dates
        if (now.isBefore(voucher.getStartDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_NOT_STARTED.getMessage());
        }

        if (now.isAfter(voucher.getEndDate())) {
            throw new BusinessException(ErrorCode.VOUCHER_EXPIRED.getMessage());
        }

        // Check total usage limit
        if (voucher.getTotalUsageLimit() != null && voucher.getUsedCount() >= voucher.getTotalUsageLimit()) {
            throw new BusinessException(ErrorCode.VOUCHER_TOTAL_LIMIT_REACHED.getMessage());
        }

        // Check if user already has this voucher
        if (!userVoucherRepository.findByUser_UserIdAndVoucher_VoucherIdAndIsDeletedFalse(
                userId, voucher.getVoucherId()).isEmpty()) {
            throw new BusinessException(ErrorCode.VOUCHER_ALREADY_OWNED.getMessage());
        }

        // Check per-user usage limit
        long userUsageCount = userVoucherRepository.countUsedVouchers(userId, voucher.getVoucherId());
        if (voucher.getPerUserLimit() != null && userUsageCount >= voucher.getPerUserLimit()) {
            throw new BusinessException(ErrorCode.VOUCHER_USER_LIMIT_REACHED.getMessage());
        }
    }

    private UserVoucherResponse mapToUserVoucherResponse(UserVoucherEntity userVoucher) {
        VoucherEntity voucher = userVoucher.getVoucher();
        LocalDateTime now = LocalDateTime.now();

        String status;
        if (userVoucher.getIsUsed()) {
            status = "USED";
        } else if (now.isAfter(voucher.getEndDate())) {
            status = "EXPIRED";
        } else {
            status = "AVAILABLE";
        }

        return UserVoucherResponse.builder()
                .userVoucherId(userVoucher.getUserVoucherId())
                .voucherId(voucher.getVoucherId())
                .code(voucher.getCode())
                .name(voucher.getName())
                .description(voucher.getDescription())
                .discountValue(voucher.getDiscountValue())
                .maxDiscountAmount(voucher.getMaxDiscountAmount())
                .minOrderValue(voucher.getMinOrderValue())
                .source(userVoucher.getSource())
                .receivedAt(userVoucher.getReceivedAt())
                .isUsed(userVoucher.getIsUsed())
                .usedAt(userVoucher.getUsedAt())
                .orderId(userVoucher.getOrder() != null ? userVoucher.getOrder().getOrderId() : null)
                .expiryDate(voucher.getEndDate())
                .status(status)
                .build();
    }

    @Override
    @Transactional
    public void importVouchers(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        List<VoucherEntity> vouchers = new ArrayList<>();
        
        try (java.io.InputStream inputStream = file.getInputStream()) {
             org.apache.poi.ss.usermodel.Workbook workbook = org.apache.poi.ss.usermodel.WorkbookFactory.create(inputStream);
             org.apache.poi.ss.usermodel.Sheet sheet = workbook.getSheetAt(0);
             
             // Date format expected: yyyy-MM-dd HH:mm
             java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
             
             for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;
                
                String code = getCellValueAsString(row.getCell(0));
                if (code == null || code.isEmpty()) continue;
                if (voucherRepository.findByCodeAndIsDeletedFalse(code).isPresent()) continue;
                
                VoucherEntity voucher = new VoucherEntity();
                voucher.setCode(code.toUpperCase());
                voucher.setName(getCellValueAsString(row.getCell(1)));
                voucher.setDescription(getCellValueAsString(row.getCell(2)));
                
                String discountTypeStr = getCellValueAsString(row.getCell(3));
                try {
                    voucher.setDiscountType(org.example.elearning.enums.DiscountType.valueOf(discountTypeStr.toUpperCase()));
                } catch (Exception e) {
                    voucher.setDiscountType(org.example.elearning.enums.DiscountType.FIXED);
                }
                
                voucher.setDiscountValue(getCellValueAsBigDecimal(row.getCell(4)));
                voucher.setMinOrderValue(getCellValueAsBigDecimal(row.getCell(5)));
                voucher.setMaxDiscountAmount(getCellValueAsBigDecimal(row.getCell(6)));
                
                voucher.setTotalUsageLimit(getCellValueAsInteger(row.getCell(7)));
                voucher.setPerUserLimit(getCellValueAsInteger(row.getCell(8)));
                
                try {
                     String startStr = getCellValueAsString(row.getCell(9));
                     if (!startStr.isEmpty()) voucher.setStartDate(LocalDateTime.parse(startStr, formatter));
                     else voucher.setStartDate(LocalDateTime.now());
                } catch(Exception e) { voucher.setStartDate(LocalDateTime.now()); }
                
                try {
                     String endStr = getCellValueAsString(row.getCell(10));
                     if (!endStr.isEmpty()) voucher.setEndDate(LocalDateTime.parse(endStr, formatter));
                     else voucher.setEndDate(LocalDateTime.now().plusMonths(1));
                } catch(Exception e) { voucher.setEndDate(LocalDateTime.now().plusMonths(1)); }

                voucher.setIsActive(true);
                 voucher.setVoucherType(VoucherType.PUBLIC);
                 voucher.setDeleted(false);
                 voucher.setUsedCount(0);
                 voucher.setApplicableTo(VoucherApplicability.ALL);
                
                vouchers.add(voucher);
             }
        }
        
        if (!vouchers.isEmpty()) {
            voucherRepository.saveAll(vouchers);
        }
    }
    
    private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> {
                    if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                         java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                         yield cell.getLocalDateTimeCellValue().format(formatter);
                    }
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
        } catch (Exception e) { return ""; }
    }

    private java.math.BigDecimal getCellValueAsBigDecimal(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return java.math.BigDecimal.ZERO;
        try {
            if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                return java.math.BigDecimal.valueOf(cell.getNumericCellValue());
            } else if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING) {
                return new java.math.BigDecimal(cell.getStringCellValue());
            }
        } catch (Exception e) { return java.math.BigDecimal.ZERO; }
        return java.math.BigDecimal.ZERO;
    }

    private Integer getCellValueAsInteger(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return null;
        try {
            if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.NUMERIC) {
                return (int) cell.getNumericCellValue();
            } else if (cell.getCellType() == org.apache.poi.ss.usermodel.CellType.STRING) {
                return Integer.parseInt(cell.getStringCellValue());
            }
        } catch (Exception e) { return null; }
        return null;
    }

    @Override
    public byte[] exportVouchers() throws IOException {
        List<VoucherEntity> vouchers = voucherRepository.findAll().stream()
                .filter(v -> !v.isDeleted())
                .collect(Collectors.toList());
        
        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Vouchers");
            
            // Header style
            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);
            headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
            headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            
            // Create header row
            String[] columns = {"ID", "Mã voucher", "Loại", "Giá trị", "Phạm vi", "Số lượng", "Đã dùng", "Ngày bắt đầu", "Ngày kết thúc", "Trạng thái"};
            Row headerRow = sheet.createRow(0);
            for (int i = 0; i < columns.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
                cell.setCellStyle(headerStyle);
            }
            
            // Fill data
            int rowIdx = 1;
            for (VoucherEntity voucher : vouchers) {
                Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(voucher.getVoucherId());
                row.createCell(1).setCellValue(voucher.getCode());
                row.createCell(2).setCellValue(voucher.getVoucherType() != null ? voucher.getVoucherType().toString() : "");
                row.createCell(3).setCellValue(voucher.getDiscountValue() != null ? voucher.getDiscountValue().doubleValue() : 0);
                row.createCell(4).setCellValue(voucher.getApplicableTo() != null ? voucher.getApplicableTo().toString() : "");
                row.createCell(5).setCellValue(voucher.getTotalUsageLimit() != null ? voucher.getTotalUsageLimit() : 0);
                row.createCell(6).setCellValue(voucher.getUsedCount() != null ? voucher.getUsedCount() : 0);
                row.createCell(7).setCellValue(voucher.getStartDate() != null ? voucher.getStartDate().toString() : "");
                row.createCell(8).setCellValue(voucher.getEndDate() != null ? voucher.getEndDate().toString() : "");
                row.createCell(9).setCellValue(voucher.getIsActive() ? "Active" : "Inactive");
            }
            
            // Auto-size columns
            for (int i = 0; i < columns.length; i++) {
                sheet.autoSizeColumn(i);
            }
            
            workbook.write(out);
            return out.toByteArray();
        }
    }
}
