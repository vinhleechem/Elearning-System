package org.example.elearning.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AccessLevel;
import lombok.EqualsAndHashCode;
import lombok.Getter;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.base.BaseCourseRequest;
import org.example.elearning.enums.CourseStatus;

@Getter
@Setter
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AdminCourseRequest extends BaseCourseRequest {
    @NotNull(message = "Instructor ID không được để trống")
    Long instructorId;

    CourseStatus status;

    private String slug;

}




