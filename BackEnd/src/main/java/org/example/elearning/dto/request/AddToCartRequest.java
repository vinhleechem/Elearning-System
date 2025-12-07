package org.example.elearning.dto.request;
import lombok.NoArgsConstructor;
import lombok.Data;
import lombok.Builder;
import lombok.AllArgsConstructor;
import jakarta.validation.constraints.NotNull;
@NotNull(message = "Course ID không được để trống")
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
public class AddToCartRequest {
    private Long courseId;
}




