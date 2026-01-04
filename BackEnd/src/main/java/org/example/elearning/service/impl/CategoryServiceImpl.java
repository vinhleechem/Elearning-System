package org.example.elearning.service.impl;

import java.util.List;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.entity.CategoryEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.mapper.CategoryMapper;
import org.example.elearning.repository.CategoryRepository;
import org.example.elearning.service.CategoryService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
    public List<CategoryResponse> getAllActiveRoots() {
        return categoryRepository.findByParentIsNullAndIsActiveTrueOrderByLevelAscNameAsc()
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public List<CategoryResponse> getChildren(Long parentId) {
        return categoryRepository.findByParentIdAndIsActiveTrueOrderByLevelAscNameAsc(parentId)
                .stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    public CategoryResponse getById(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
        return categoryMapper.toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryEntity getCategoryEntityById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getCategoryTree() {
        // Lấy toàn bộ root categories + children (recursive)
        List<CategoryEntity> roots = categoryRepository.findByParentIsNull();
        return roots.stream()
                .map(categoryMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public CategoryResponse create(CategoryRequest request) {
        CategoryEntity parent = null;
        Integer level = 1;

        if (request.getParentId() != null) {
            parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
            level = parent.getLevel() + 1;
        }

        CategoryEntity entity = CategoryEntity.builder()
                .name(request.getName())
                .slug(request.getSlug())
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
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));

        entity.setName(request.getName());
        entity.setSlug(request.getSlug());

        if (request.getParentId() != null) {
            CategoryEntity parent = categoryRepository.findById(request.getParentId())
                    .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
            entity.setParent(parent);
            entity.setLevel(parent.getLevel() + 1);
        }

        return categoryMapper.toResponse(categoryRepository.save(entity));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        CategoryEntity entity = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.PERMISSION_NOT_FOUND.getMessage()));
        categoryRepository.delete(entity);
    }
}


