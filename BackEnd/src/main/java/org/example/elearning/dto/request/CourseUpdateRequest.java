package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

import java.math.BigDecimal;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseUpdateRequest {

    @NotBlank(message = "Tiêu đề không được để trống")
    String title;

    @NotNull(message = "Category id không được để trống")
    Long categoryId;

    @NotBlank(message = "Mô tả ngắn không được để trống")
    String shortDescription;
    
    @NotBlank(message = "Mô tả chi tiết không được để trống")
    String description;
    
    @NotBlank(message = "Nội dung học được không được để trống")
    String whatYouLearn;
    
    @NotBlank(message = "Yêu cầu không được để trống")
    String requirements;
    
    @NotBlank(message = "Đối tượng mục tiêu không được để trống")
    String targetAudience;
    
    @NotBlank(message = "Ảnh thumbnail không được để trống")
    String thumbnailUrl;

    @NotNull(message = "Giá không được để trống")
    BigDecimal price;
    
    @NotBlank(message = "Ngôn ngữ không được để trống")
    String language;
    
    @NotBlank(message = "Cấp độ không được để trống")
    String level;
    
    Boolean hasCertificate;
}


