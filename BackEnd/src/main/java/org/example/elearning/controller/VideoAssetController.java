package org.example.elearning.controller;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.VideoAssetRequest;
import org.example.elearning.dto.response.StandardResponse;
import org.example.elearning.dto.response.VideoAssetResponse;
import org.example.elearning.service.VideoAssetService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import static org.example.elearning.dto.response.StandardResponse.success;

@RestController
@RequestMapping("/api/v1/videos")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class VideoAssetController {

    VideoAssetService videoAssetService;

    @Operation(summary = "Upload video file")
    @ApiResponse(responseCode = "200", description = "Upload thành công")
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasAnyRole('INSTRUCTOR', 'ADMIN')")
    public ResponseEntity<StandardResponse<VideoAssetResponse>> uploadVideo(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title) {
        VideoAssetResponse result = videoAssetService.uploadVideo(file, title);
        return ResponseEntity.ok(success("Upload video thành công", result));
    }

    @Operation(summary = "Tạo video asset (metadata)")
    @ApiResponse(responseCode = "200", description = "Tạo thành công")
    @PostMapping
    public ResponseEntity<StandardResponse<VideoAssetResponse>> create(
            @Valid @RequestBody VideoAssetRequest request) {
        VideoAssetResponse result = videoAssetService.create(request);
        return ResponseEntity.ok(success("Tạo video asset thành công", result));
    }

    @Operation(summary = "Lấy chi tiết video asset")
    @ApiResponse(responseCode = "200", description = "Lấy thành công")
    @GetMapping("/{id}")
    public ResponseEntity<StandardResponse<VideoAssetResponse>> get(@PathVariable Long id) {
        VideoAssetResponse result = videoAssetService.getById(id);
        return ResponseEntity.ok(success("Lấy video asset thành công", result));
    }

    @Operation(summary = "Cập nhật video asset")
    @ApiResponse(responseCode = "200", description = "Cập nhật thành công")
    @PutMapping("/{id}")
    public ResponseEntity<StandardResponse<VideoAssetResponse>> update(
            @PathVariable Long id,
            @Valid @RequestBody VideoAssetRequest request) {
        VideoAssetResponse result = videoAssetService.update(id, request);
        return ResponseEntity.ok(success("Cập nhật video asset thành công", result));
    }

    @Operation(summary = "Xóa video asset")
    @ApiResponse(responseCode = "200", description = "Xóa thành công")
    @DeleteMapping("/{id}")
    public ResponseEntity<StandardResponse<String>> delete(@PathVariable Long id) {
        videoAssetService.delete(id);
        return ResponseEntity.ok(success("Xóa video asset thành công"));
    }
}
