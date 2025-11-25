package org.example.elearning.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public abstract class ResponseAbstract {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    protected ResponseAbstract() {};
}
