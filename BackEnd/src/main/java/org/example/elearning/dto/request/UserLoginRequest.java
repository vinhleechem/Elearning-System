package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserLoginRequest {
    @NotBlank(message = "Email không được để trống")
    String email;
    @NotBlank(message = "Password không được để trống")
    @Size(min = 4, message = "Password phải có ít nhất 4 ký tự")
    String password;
}
