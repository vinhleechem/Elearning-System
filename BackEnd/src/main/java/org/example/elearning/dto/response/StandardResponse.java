package org.example.elearning.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.*;

import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
@Builder
public class StandardResponse<T> {

    @Builder.Default
    private boolean success = true;

    private String message;

    private T data;

    private String errorCode;

    public static <T> StandardResponse<T> success(T data) {
        return StandardResponse.<T>builder()
                .data(data)
                .build();
    }

    public static <T> StandardResponse<T> success(String message, T data) {
        return StandardResponse.<T>builder()
                .message(message)
                .data(data)
                .build();
    }

    public static <T> StandardResponse<T> success(String message) {
        return StandardResponse.<T>builder()
                .message(message)
                .build();
    }

    public static <T> StandardResponse<T> error(String message) {
        return StandardResponse.<T>builder()
                .success(false)
                .message(message)
                .build();
    }

    public static <T> StandardResponse<T> error(String message, String errorCode) {
        return StandardResponse.<T>builder()
                .success(false)
                .message(message)
                .errorCode(errorCode)
                .build();
    }

    public static <T> StandardResponse<T> error(String message, T data) {
        return StandardResponse.<T>builder()
                .success(false)
                .message(message)
                .data(data)
                .build();
    }
}
