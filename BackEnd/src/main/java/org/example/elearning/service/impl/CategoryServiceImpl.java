package org.example.elearning.service.impl;

import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CategoryMapper;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.service.CategoryService;
import java.util.Optional;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
import java.io.ByteArrayOutputStream;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.example.elearning.utils.SlugUtils;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryServiceImpl implements CategoryService {

    CategoryRepository categoryRepository;
    CategoryMapper categoryMapper;

    @Override
    public CategoryEntity getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));
    }

    @Override
    public CategoryEntity getLevel3CategoryEntityById(Long id) {
        CategoryEntity categoryEntity = getCategoryEntityById(id);
        if(!isLevel3Category(categoryEntity.getId())){
            throw new ResourceNotFoundException(ErrorCode.CATEGORY_MUST_BE_LEVEL_3.getMessage());
        }
        return categoryEntity;
    }

    @Override
    public List<CategoryResponse> getAllActiveRoots() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueAndIsDeletedFalseOrderByNameAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getChildren(Long parentId) {
        return categoryRepository.findByParentIdAndIsActiveTrueAndIsDeletedFalseOrderByLevelAscNameAsc(parentId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getById(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));
        return categoryMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        // Load tất cả categories trong 1 query duy nhất (tránh N+1)
        List<CategoryEntity> all = categoryRepository.findAllForTree();

        // Build flat DTO map keyed by id
        Map<Long, CategoryResponse> dtoMap = new HashMap<>();
        for (CategoryEntity cat : all) {
            CategoryResponse dto = CategoryResponse.builder()
                    .id(cat.getId())
                    .name(cat.getName())
                    .slug(cat.getSlug())
                    .level(cat.getLevel())
                    .isActive(cat.getIsActive())
                    .parentId(cat.getParent() != null ? cat.getParent().getId() : null)
                    .children(new ArrayList<>())
                    .build();
            dtoMap.put(cat.getId(), dto);
        }

        // Gắn children vào parent, collect roots
        List<CategoryResponse> roots = new ArrayList<>();
        for (CategoryEntity cat : all) {
            CategoryResponse dto = dtoMap.get(cat.getId());
            if (cat.getParent() == null) {
                roots.add(dto);
            } else {
                CategoryResponse parentDto = dtoMap.get(cat.getParent().getId());
                if (parentDto != null) {
                    parentDto.getChildren().add(dto);
                }
            }
        }
        return roots;
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        CategoryEntity parent = null;
        int level = 1;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));
            level = parent.getLevel() + 1;
        }

        // Auto-generate unique slug if not provided
        String slug = generateUniqueSlug(request.getSlug(), request.getName());

        CategoryEntity entity = CategoryEntity.builder()
                .name(request.getName())
                .slug(slug)
                .parent(parent)
                .level(level)
                .isActive(true)
                .build();

        return categoryMapper.toResponse(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public CategoryResponse update(Long id, CategoryRequest request) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));

        entity.setName(request.getName());
        
        // Slug is immutable - không cho phép update

        if (request.getParentId() != null) {
            CategoryEntity parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));
            entity.setParent(parent);
            entity.setLevel(parent.getLevel() + 1);
        }

        return categoryMapper.toResponse(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.CATEGORY_NOT_FOUND.getMessage()));
        
        entity.setDeleted(true);
        categoryRepository.save(entity);
    }

    @Override
    public boolean isLevel3Category(Long categoryId) {
        CategoryEntity category = getCategoryEntityById(categoryId);
        return category.getLevel() == 3;
    }

    @Override
    @Transactional
    public void importCategories(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header

                String name = getCellValue(row, 0);
                if (name == null || name.isEmpty()) continue;

                String rawSlug = getCellValue(row, 1);
                String slug = generateUniqueSlug(rawSlug, name);

                String parentIdStr = getCellValue(row, 2);
                CategoryEntity parent = null;
                Integer level = 1;
                if (parentIdStr != null && !parentIdStr.isEmpty()) {
                    try {
                        double val = Double.parseDouble(parentIdStr);
                        Long parentId = (long) val;
                        Optional<CategoryEntity> parentOpt = categoryRepository.findById(parentId);
                        if (parentOpt.isPresent()) {
                            parent = parentOpt.get();
                            level = parent.getLevel() + 1;
                        }
                    } catch (NumberFormatException e) {
                        // Ignore
                    }
                }

                CategoryEntity entity = CategoryEntity.builder()
                        .name(name)
                        .slug(slug)
                        .parent(parent)
                        .level(level)
                        .isActive(true)
                        .build();

                categoryRepository.save(entity);
            }
        }
    }


    @Override
    public byte[] generateImportTemplate() throws IOException {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Categories");
            Row header = sheet.createRow(0);
            header.createCell(0).setCellValue("Name");
            header.createCell(1).setCellValue("Slug (Optional)");
            header.createCell(2).setCellValue("Parent ID (Optional)");

            Row row = sheet.createRow(1);
            row.createCell(0).setCellValue("Example Category");
            row.createCell(1).setCellValue("example-category");
            row.createCell(2).setCellValue(1);

            ByteArrayOutputStream bos = new ByteArrayOutputStream();
            workbook.write(bos);
            return bos.toByteArray();
        }
    }


    private String getCellValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }



    private String generateUniqueSlug(String providedSlug, String name) {
        String baseSlug = (providedSlug != null && !providedSlug.trim().isEmpty()) 
                ? SlugUtils.toSlug(providedSlug) 
                : SlugUtils.toSlug(name);
        
        if (baseSlug.isEmpty()) {
            baseSlug = "category";
        }
        
        String slug = baseSlug;
        int counter = 2;
        while (categoryRepository.findBySlugAndIsDeletedFalse(slug).isPresent()) {
            slug = SlugUtils.makeUnique(baseSlug, counter++);
        }
        
        return slug;
    }
}


