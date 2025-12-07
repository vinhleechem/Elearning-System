package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class SectionRequest {

    @NotBlank(message = "Tiêu đề section không được để trống")
    String title;

    Integer position;
}


