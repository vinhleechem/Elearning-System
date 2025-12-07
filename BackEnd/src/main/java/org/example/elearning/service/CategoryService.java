package org.example.elearning.service;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    List<CategoryResponse> getAllActiveRoots();

    List<CategoryResponse> getChildren(Long parentId);

    CategoryResponse getById(Long id);

    CategoryResponse create(CategoryRequest request);

    CategoryResponse update(Long id, CategoryRequest request);

    void delete(Long id);
}


