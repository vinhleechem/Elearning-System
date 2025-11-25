package org.example.elearning.dto.request;

import jakarta.validation.constraints.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.validator.ConfirmPasswordConstraint;

@Getter
@Setter
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
@ConfirmPasswordConstraint
public class RegisterRequest {
    @NotBlank(message = "Email must not be blank")
    @Email(message = "Email format is invalid")
    String email;

    @NotBlank(message = "Full name must not be blank")
    String fullName;

    @NotBlank(message = "Password must not be blank")
    @Size(min = 4, message = "Password must be at least 5 characters")
    String password;

    String confirmPassword;
}
