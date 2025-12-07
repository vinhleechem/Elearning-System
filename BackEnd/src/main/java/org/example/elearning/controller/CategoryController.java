package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.aspect.SecuredEndpoint;
import org.example.elearning.dto.request.CategoryRequest;
import org.example.elearning.dto.response.CategoryResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.CategoryService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/categories")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class CategoryController {

    CategoryService categoryService;

    @Operation(summary = "Lấy danh sách category root đang active")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping
    public ResponseEntity<StandardResponse<List<CategoryResponse>>> getRootCategories() {
        List<CategoryResponse> result = categoryService.getAllActiveRoots();
        return ResponseEntity.ok(success("Lấy danh sách category thành công", result));
    }

    @Operation(summary = "Lấy danh sách category con theo parentId")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{parentId}/children")
    public ResponseEntity<StandardResponse<List<CategoryResponse>>> getChildren(
            @PathVariable Long parentId) {
        List<CategoryResponse> result = categoryService.getChildren(parentId);
        return ResponseEntity.ok(success("Lấy danh sách category con thành công", result));
    }

    @Operation(summary = "Lấy chi tiết category")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<CategoryResponse>> getCategory(@PathVariable Long id) {
        CategoryResponse result = categoryService.getById(id);
        return ResponseEntity.ok(success("Lấy category thành công", result));
    }

    @Operation(summary = "Tạo category mới")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("CREATE_USER")
    public ResponseEntity<StandardResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse result = categoryService.create(request);
        return ResponseEntity.ok(success("Tạo category thành công", result));
    }

    @Operation(summary = "Cập nhật category")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("UPDATE_USER")
    public ResponseEntity<StandardResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody CategoryRequest request) {
        CategoryResponse result = categoryService.update(id, request);
        return ResponseEntity.ok(success("Cập nhật category thành công", result));
    }

    @Operation(summary = "Xóa category")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @SecuredEndpoint("DELETE_USER")
    public ResponseEntity<StandardResponse<String>> deleteCategory(@PathVariable Long id) {
        categoryService.delete(id);
        return ResponseEntity.ok(success("Xóa category thành công"));
    }
}
