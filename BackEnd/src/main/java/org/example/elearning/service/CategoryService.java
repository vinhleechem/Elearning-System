package org.example.elearning.service;

import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;

import java.util.List;

public interface CategoryService {
    // Lấy root categories đang active
    List<CategoryResponse> getAllActiveRoots();

    // Lấy children của 1 category
    List<CategoryResponse> getChildren(Long parentId);

    // Lấy category theo ID
    CategoryResponse getById(Long id);

    // Lấy toàn bộ category tree (recursive)
    List<CategoryResponse> getCategoryTree();

    // Tạo category mới
    CategoryResponse create(CategoryRequest request);

    // Cập nhật category
    CategoryResponse update(Long id, CategoryRequest request);

    // Xóa category
    void delete(Long id);
}


