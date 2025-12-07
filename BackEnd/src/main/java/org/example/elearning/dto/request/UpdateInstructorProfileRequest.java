package org.example.elearning.dto.request;

import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInstructorProfileRequest {
    @Size(max = 200, message = "Headline không được quá 200 ký tự")
    private String headline;

    @Size(max = 1000, message = "Biography không được quá 1000 ký tự")
    private String biography;

    private String website;
    private String linkedin;
    private String twitter;
    private String youtube;
}

