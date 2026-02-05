package org.example.elearning.dto.response;

import lombok.Builder;
import lombok.Data;

import java.util.Date;

@Data
@Builder
public class ErrorResponse {
    private int code;
    private int status;
    private String error;
    private Date timestamp;
    private String path;
}
