package org.example.elearning.validator;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;
// cho phép annotation apply lên attribute, class
@Target({ElementType.FIELD,ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = {ConfirmPasswordValidator.class})
public @interface ConfirmPasswordConstraint {
    String message() default "Xác nhận mật khẩu không hợp lệ";
    Class<?>[] groups() default { };

    Class<? extends Payload>[] payload() default { };
}
