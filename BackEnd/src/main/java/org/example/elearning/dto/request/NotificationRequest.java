package org.example.elearning.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRequest {
    private String title;
    private String message;
    private String type; // INFO, SUCCESS, WARNING, ERROR
    private Long userId;
    private String link; // Optional link to navigate
}
