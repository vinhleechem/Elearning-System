package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_progress")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonProgressEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "progress_id")
    Long progressId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "enrollment_id", nullable = false)
    EnrollmentEntity enrollment;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    LessonEntity lesson;

    @Column(name = "is_completed", nullable = false)
    @Builder.Default
    Boolean isCompleted = false;

    @Column(name = "completed_at")
    LocalDateTime completedAt;

    // Thời gian đã xem (giây) - cho video
    @Column(name = "time_spent_seconds")
    @Builder.Default
    Integer timeSpentSeconds = 0;

    // Vị trí cuối cùng trong video (giây)
    @Column(name = "last_position_seconds")
    @Builder.Default
    Integer lastPositionSeconds = 0;

    // Lần cuối truy cập
    @Column(name = "last_accessed_at")
    LocalDateTime lastAccessedAt;
}
