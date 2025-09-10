package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "enrollment")
public class EnrollmentEntity extends BaseEntity{

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "enrollment_id")
    Long enrollmentId;

    @CreationTimestamp
    @Column(name = "enrolled_at", updatable = false)
    LocalDateTime enrolledAt;

    // Tiến độ học (%)
    @Column(name = "progress", nullable = false)
    Float progress = 0f;
}

