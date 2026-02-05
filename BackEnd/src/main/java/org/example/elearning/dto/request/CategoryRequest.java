package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CategoryRequest {

    @NotBlank(message = "Tên danh mục không được để trống")
    @Size(max = 255, message = "Tên danh mục không được vượt quá 255 ký tự")
    String name;

    @Size(max = 255, message = "Slug không được vượt quá 255 ký tự")
    @Pattern(
            regexp = "^[a-z0-9]+(?:-[a-z0-9]+)*$",
            message = "Slug chỉ được chứa chữ thường, số và dấu gạch ngang"
    )
    String slug;

    Long parentId;
}


