package org.example.elearning.service;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.entity.CategoryEntity;

import java.util.List;

public interface CategoryService {
    CategoryEntity getCategoryEntityById(Long id);

    CategoryEntity getLevel3CategoryEntityById(Long id);

    List<CategoryResponse> getAllActiveRoots();

    List<CategoryResponse> getChildren(Long parentId);

    CategoryResponse getById(Long id);

    List<CategoryResponse> getCategoryTree();

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);

    void importCategories(org.springframework.web.multipart.MultipartFile file) throws java.io.IOException;

    byte[] generateImportTemplate() throws java.io.IOException;
    
    boolean isLevel3Category(Long categoryId);
}


