package org.example.elearning.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class VideoPositionRequest {
    @NotNull(message = "Vị trí video không được để trống")
    @Min(value = 0, message = "Vị trí video không hợp lệ")
    Integer positionSeconds;
}
