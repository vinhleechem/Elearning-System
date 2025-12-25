package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.example.elearning.dto.request.PromotionRequest;
import org.example.elearning.dto.response.PromotionDetailResponse;
import org.example.elearning.dto.response.PromotionResponse;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.service.PromotionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/promotions")
@RequiredArgsConstructor
@Tag(name = "Promotion Management", description = "APIs for managing promotions and campaign discounts")
public class PromotionController {

    private final PromotionService promotionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create new promotion", description = "Create a new promotion with rules (Admin only)")
    public ResponseEntity<StandardResponse<PromotionDetailResponse>> createPromotion(@Valid @RequestBody PromotionRequest request) {
        PromotionDetailResponse response = promotionService.createPromotion(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(StandardResponse.success(response));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update promotion", description = "Update existing promotion (Admin only)")
    public ResponseEntity<StandardResponse<PromotionDetailResponse>> updatePromotion(
            @PathVariable Long id,
            @Valid @RequestBody PromotionRequest request) {
        PromotionDetailResponse response = promotionService.updatePromotion(id, request);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get promotion by ID", description = "Get detailed information about a promotion")
    public ResponseEntity<StandardResponse<PromotionDetailResponse>> getPromotionById(@PathVariable Long id) {
        PromotionDetailResponse response = promotionService.getPromotionById(id);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get all promotions", description = "Get paginated list of all promotions (Admin only)")
    public ResponseEntity<StandardResponse<Page<PromotionResponse>>> getAllPromotions(Pageable pageable) {
        Page<PromotionResponse> response = promotionService.getAllPromotions(pageable);
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @GetMapping("/active")
    @Operation(summary = "Get active promotions", description = "Get list of currently active promotions")
    public ResponseEntity<StandardResponse<List<PromotionResponse>>> getActivePromotions() {
        List<PromotionResponse> response = promotionService.getActivePromotions();
        return ResponseEntity.ok(StandardResponse.success(response));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete promotion", description = "Soft delete a promotion (Admin only)")
    public ResponseEntity<StandardResponse<String>> deletePromotion(@PathVariable Long id) {
        promotionService.deletePromotion(id);
        return ResponseEntity.ok(StandardResponse.success("Promotion deleted successfully"));
    }

    @PatchMapping("/{id}/activate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Activate promotion", description = "Activate a promotion (Admin only)")
    public ResponseEntity<StandardResponse<String>> activatePromotion(@PathVariable Long id) {
        promotionService.activatePromotion(id);
        return ResponseEntity.ok(StandardResponse.success("Promotion activated successfully"));
    }

    @PatchMapping("/{id}/deactivate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Deactivate promotion", description = "Deactivate a promotion (Admin only)")
    public ResponseEntity<StandardResponse<String>> deactivatePromotion(@PathVariable Long id) {
        promotionService.deactivatePromotion(id);
        return ResponseEntity.ok(StandardResponse.success("Promotion deactivated successfully"));
    }
}
