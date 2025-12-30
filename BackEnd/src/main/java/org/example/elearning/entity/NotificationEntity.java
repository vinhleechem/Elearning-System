package org.example.elearning.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.NotificationType;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "notifications")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class NotificationEntity extends BaseEntity {
    @Id
    @Column(name = "notification_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long notificationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    UserEntity user;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    NotificationType type;

    @Column(name = "title", length = 200)
    String title;

    @Column(name = "message", columnDefinition = "TEXT")
    String message;

    @Column(name = "is_read")
    @Builder.Default
    Boolean isRead = false;
}
