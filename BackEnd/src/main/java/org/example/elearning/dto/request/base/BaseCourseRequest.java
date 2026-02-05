package org.example.elearning.dto.request.base;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.example.elearning.enums.CourseLevel;

import java.math.BigDecimal;

@Data
public abstract class BaseCourseRequest {
    @NotNull(message = "Category id không được để trống")
    private Long categoryId;

    @NotBlank(message = "Tiêu đề không được để trống")
    private String title;

    @NotBlank(message = "Mô tả ngắn không được để trống")
    private String shortDescription;

    @NotBlank(message = "Mô tả chi tiết không được để trống")
    private String description;

    @NotBlank(message = "Nội dung học được không được để trống")
    private String whatYouLearn;

    @NotBlank(message = "Yêu cầu không được để trống")
    private String requirements;

    @NotBlank(message = "Đối tượng mục tiêu không được để trống")
    private String targetAudience;

    @NotBlank(message = "Ảnh thumbnail không được để trống")
    private String thumbnailUrl;
    @NotNull(message = "Giá không được để trống")
    private BigDecimal price;

    @NotBlank(message = "Ngôn ngữ không được để trống")
    private String language;

    @NotNull(message = "Cấp độ không được để trống")
    private CourseLevel level;

    private Boolean hasCertificate;
}
