package org.example.elearning.service.impl;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.request.PromotionRuleRequest;
import org.example.elearning.dto.response.CartItemResponse;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.entity.PromotionEntity;
import org.example.elearning.entity.PromotionRuleEntity;
import org.example.elearning.enums.DiscountType;
import org.example.elearning.enums.PromotionRuleType;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.PromotionMapper;
import org.example.elearning.mapper.PromotionRuleMapper;
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.PromotionRepository;
import org.example.elearning.service.PromotionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PromotionServiceImpl implements PromotionService {

    PromotionRepository promotionRepository;
    PromotionMapper promotionMapper;
    CourseRepository courseRepository;
    CategoryRepository categoryRepository;
    PromotionRuleMapper promotionRuleMapper;


    @Override
    @Transactional
    public PromotionDetailResponse createPromotion(PromotionRequest request) {
        PromotionEntity promotion = promotionMapper.toEntity(request);

        for (PromotionRuleRequest ruleRequest : request.getRules()) {
            PromotionRuleEntity rule = promotionRuleMapper.toEntity(ruleRequest);
            rule.setPromotion(promotion);
            resolveRuleTargets(rule, ruleRequest);
            promotion.getRules().add(rule);
        }

        return promotionMapper.toDetailResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionDetailResponse updatePromotion(Long promotionId, PromotionRequest request) {
        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));
        // Update basic fields using mapper
        promotionMapper.updateEntity(promotion, request);

        // Clear old rules and add new ones
        promotion.getRules().clear();

        for (PromotionRuleRequest ruleRequest : request.getRules()) {
            PromotionRuleEntity rule = promotionRuleMapper.toEntity(ruleRequest);
            rule.setPromotion(promotion);
            resolveRuleTargets(rule, ruleRequest);
            promotion.getRules().add(rule);
        }



        return promotionMapper.toDetailResponse(promotionRepository.save(promotion));
    }

    @Override
    @Transactional
    public PromotionDetailResponse getPromotionById(Long promotionId) {
        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        return promotionMapper.toDetailResponse(promotion);
    }

    @Override
    @Transactional
    public Page<PromotionResponse> getAllPromotions(Pageable pageable) {
        return promotionRepository.findAll(pageable)
                .map(promotionMapper::toResponse);
    }

    @Override
    public List<PromotionResponse> getActivePromotions() {
        LocalDateTime now = LocalDateTime.now();
        List<PromotionEntity> promotions = promotionRepository.findActivePromotions(now);

        return promotions.stream()
                .map(promotionMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public List<PromotionEntity> getActivePromotionEntities() {
        LocalDateTime now = LocalDateTime.now();
        return promotionRepository.findActivePromotions(now);
    }

    @Override
    @Transactional
    public void deletePromotion(Long promotionId) {

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setDeleted(true);
        promotionRepository.save(promotion);
    }

    @Override
    @Transactional
    public void activatePromotion(Long promotionId) {

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setIsActive(true);
        promotionRepository.save(promotion);

        // Sync course prices after activation
        syncCoursePrices();

    }

    @Override
    @Transactional
    public void deactivatePromotion(Long promotionId) {

        PromotionEntity promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PROMOTION_NOT_FOUND.getMessage()));

        promotion.setIsActive(false);
        promotionRepository.save(promotion);

        syncCoursePrices();

    }

    @Override
    @Transactional
    public void syncCoursePrices() {
        log.info("Starting to sync current prices for all courses");
        List<CourseEntity> allCourses = courseRepository.findAll();
        List<PromotionEntity> activePromotions = getActivePromotionEntities();

        int updated = 0;
        for (CourseEntity course : allCourses) {
            if (updateCourseCurrentPrice(course, activePromotions)) {
                updated++;
            }
        }

        courseRepository.saveAll(allCourses);
        log.info("Synced current prices for {} courses", updated);
    }

    @Override
    @Transactional
    public void syncCoursePrice(Long courseId) {
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        ErrorCode.COURSE_NOT_FOUND.getMessage()));
        List<PromotionEntity> activePromotions = getActivePromotionEntities();

        if (updateCourseCurrentPrice(course, activePromotions)) {
            courseRepository.save(course);
            log.info("Synced current price for course ID: {}", courseId);
        }
    }


    private boolean updateCourseCurrentPrice(CourseEntity course, List<PromotionEntity> activePromotions) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return false;
        }

        BigDecimal bestDiscountAmount = BigDecimal.ZERO;

        for (PromotionEntity promotion : activePromotions) {
            for (PromotionRuleEntity rule : promotion.getRules()) {
                if (isRuleApplicable(rule, course)) {
                    BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                    if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                        bestDiscountAmount = discountAmount;
                    }
                }
            }
        }

        BigDecimal newCurrentPrice;
        if (bestDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            newCurrentPrice = course.getPrice().subtract(bestDiscountAmount);
        } else {
            newCurrentPrice = course.getPrice();
        }

        // Only update if price changed
        if (course.getCurrentPrice() == null || course.getCurrentPrice().compareTo(newCurrentPrice) != 0) {
            course.setCurrentPrice(newCurrentPrice);
            return true;
        }

        return false;
    }

    @Override
    public void applyBestPromotionToCourse(CourseResponse response, CourseEntity course) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        List<PromotionEntity> activePromotions = getActivePromotionEntities();
        BigDecimal bestDiscountAmount = BigDecimal.ZERO;
        PromotionEntity bestPromotion = null;

        for (PromotionEntity promotion : activePromotions) {
            for (PromotionRuleEntity rule : promotion.getRules()) {
                if (isRuleApplicable(rule, course)) {
                    BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                    if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                        bestDiscountAmount = discountAmount;
                        bestPromotion = promotion;
                    }
                }
            }
        }

        if (bestPromotion != null) {
            response.setPromotionName(bestPromotion.getName());
            response.setPromotionType(bestPromotion.getPromotionType().name());
            response.setPromotionEndDate(bestPromotion.getEndDate());
            int percentage = bestDiscountAmount.divide(course.getPrice(), 2, RoundingMode.HALF_UP)
                    .multiply(new BigDecimal(100)).intValue();
            response.setDiscountPercentage(percentage);
        }
    }

    @Override
    public void applyBestPromotionToCartItem(CartItemResponse response, CourseEntity course) {
        if (course.getPrice() == null || course.getPrice().compareTo(BigDecimal.ZERO) == 0) {
            return;
        }

        List<PromotionEntity> activePromotions = getActivePromotionEntities();
        BigDecimal bestDiscountAmount = BigDecimal.ZERO;

        for (PromotionEntity promotion : activePromotions) {
            for (PromotionRuleEntity rule : promotion.getRules()) {
                if (isRuleApplicable(rule, course)) {
                    BigDecimal discountAmount = calculateDiscountAmount(rule, course.getPrice());
                    if (discountAmount.compareTo(bestDiscountAmount) > 0) {
                        bestDiscountAmount = discountAmount;
                    }
                }
            }
        }

        if (bestDiscountAmount.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal finalPrice = course.getPrice().subtract(bestDiscountAmount);
            if (finalPrice.compareTo(BigDecimal.ZERO) < 0) {
                finalPrice = BigDecimal.ZERO;
            }
            response.setDiscountPrice(finalPrice);
        }
    }

    private void resolveRuleTargets(PromotionRuleEntity rule, PromotionRuleRequest ruleRequest) {
        if (ruleRequest.getRuleType() == PromotionRuleType.COURSE && ruleRequest.getCourseId() != null) {
            CourseEntity course = courseRepository.findById(ruleRequest.getCourseId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.COURSE_NOT_FOUND.getMessage()));
            rule.setCourse(course);
        } else if (ruleRequest.getRuleType() == PromotionRuleType.CATEGORY && ruleRequest.getCategoryId() != null) {
            CategoryEntity category = categoryRepository.findById(ruleRequest.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            rule.setCategory(category);
        }
    }

    private boolean isRuleApplicable(PromotionRuleEntity rule, CourseEntity course) {
        if (rule.getRuleType() == PromotionRuleType.ALL) {
            return true;
        }
        if (rule.getRuleType() == PromotionRuleType.COURSE) {
            return rule.getCourse() != null && rule.getCourse().getCourseId().equals(course.getCourseId());
        }
        if (rule.getRuleType() == PromotionRuleType.CATEGORY) {
            return rule.getCategory() != null && rule.getCategory().getId().equals(course.getCategory().getId());
        }
        return false;
    }

    private BigDecimal calculateDiscountAmount(PromotionRuleEntity rule, BigDecimal price) {
        if (rule.getDiscountType() == DiscountType.FIXED) {
            return rule.getDiscountValue();
        } else {
            BigDecimal discount = price.multiply(rule.getDiscountValue().divide(new BigDecimal(100)));
            if (rule.getMaxDiscountAmount() != null && discount.compareTo(rule.getMaxDiscountAmount()) > 0) {
                return rule.getMaxDiscountAmount();
            }
            return discount;
        }
    }

    @Override
    @Transactional
    public void importPromotions(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException {
        List<PromotionEntity> promotions = new ArrayList<>();

        try (java.io.InputStream inputStream = file.getInputStream()) {
             Workbook workbook = WorkbookFactory.create(inputStream);
             Sheet sheet = workbook.getSheetAt(0);

             // Date format expected: yyyy-MM-dd HH:mm
             DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

             for (int i = 1; i <= sheet.getLastRowNum(); i++) {
                org.apache.poi.ss.usermodel.Row row = sheet.getRow(i);
                if (row == null) continue;

                String name = getCellValueAsString(row.getCell(0));
                if (name == null || name.isEmpty()) continue;

                PromotionEntity promotion = new PromotionEntity();
                promotion.setName(name);
                promotion.setDescription(getCellValueAsString(row.getCell(1)));

                String typeStr = getCellValueAsString(row.getCell(2));
                try {
                    promotion.setPromotionType(org.example.elearning.enums.PromotionType.valueOf(typeStr.toUpperCase()));
                } catch (Exception e) {
                    promotion.setPromotionType(org.example.elearning.enums.PromotionType.SEASONAL);
                }

                try {
                    String startStr = getCellValueAsString(row.getCell(3));
                    if (!startStr.isEmpty())
                        promotion.setStartDate(LocalDateTime.parse(startStr, formatter));
                    else
                        promotion.setStartDate(LocalDateTime.now());
                } catch (Exception e) {
                    promotion.setStartDate(LocalDateTime.now());
                }

                try {
                    String endStr = getCellValueAsString(row.getCell(4));
                     if (!endStr.isEmpty())
                        promotion.setEndDate(LocalDateTime.parse(endStr, formatter));
                     else
                        promotion.setEndDate(LocalDateTime.now().plusDays(7));
                } catch (Exception e) {
                     promotion.setEndDate(LocalDateTime.now().plusDays(7));
                }

                promotion.setIsActive(true);
                promotion.setPriority(0);
                promotion.setDeleted(false);
                promotion.setRules(new ArrayList<>());

                promotions.add(promotion);
             }
        }

        if (!promotions.isEmpty()) {
            promotionRepository.saveAll(promotions);
        }
    }

    @Override
    public byte[] exportPromotions() throws IOException {
        List<PromotionEntity> promotions = promotionRepository.findAll();

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Promotions");
            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

            // Create header row
            Row headerRow = sheet.createRow(0);
            String[] headers = {"ID", "Tên khuyến mãi", "Mô tả", "Loại", "Ngày bắt đầu", "Ngày kết thúc", "Độ ưu tiên", "Trạng thái"};

            CellStyle headerStyle = workbook.createCellStyle();
            Font headerFont = workbook.createFont();
            headerFont.setBold(true);
            headerStyle.setFont(headerFont);

            for (int i = 0; i < headers.length; i++) {
                Cell cell = headerRow.createCell(i);
                cell.setCellValue(headers[i]);
                cell.setCellStyle(headerStyle);
            }

            // Fill data rows
            int rowNum = 1;
            for (PromotionEntity promotion : promotions) {
                Row row = sheet.createRow(rowNum++);
                row.createCell(0).setCellValue(promotion.getPromotionId());
                row.createCell(1).setCellValue(promotion.getName());
                row.createCell(2).setCellValue(promotion.getDescription() != null ? promotion.getDescription() : "");
                row.createCell(3).setCellValue(promotion.getPromotionType().name());
                row.createCell(4).setCellValue(promotion.getStartDate().format(dateFormatter));
                row.createCell(5).setCellValue(promotion.getEndDate().format(dateFormatter));
                row.createCell(6).setCellValue(promotion.getPriority());
                row.createCell(7).setCellValue(promotion.getIsActive() ? "Đang hoạt động" : "Không hoạt động");
            }

            // Auto-size columns
            for (int i = 0; i < headers.length; i++) {
                sheet.autoSizeColumn(i);
            }

            // Write to byte array
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            log.info("Successfully exported {} promotions", promotions.size());
            return outputStream.toByteArray();
        }
    }

     private String getCellValueAsString(org.apache.poi.ss.usermodel.Cell cell) {
        if (cell == null) return "";
        try {
            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue();
                case NUMERIC -> {
                    if (org.apache.poi.ss.usermodel.DateUtil.isCellDateFormatted(cell)) {
                         DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                         yield cell.getLocalDateTimeCellValue().format(formatter);
                    }
                    yield String.valueOf((long) cell.getNumericCellValue());
                }
                case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
                default -> "";
            };
            } catch (Exception e) { return ""; }
    }
}
