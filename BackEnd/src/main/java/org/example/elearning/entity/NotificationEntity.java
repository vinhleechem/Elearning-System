package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.NotificationType;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "notification")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEntity extends BaseEntity{
    @Id
    @Column(name = "notification_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long notificationId;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    NotificationType type;

    @Column(name = "title", length = 200)
    private String title;

    @Lob
    @Column(name = "message")
    private String message;
}
