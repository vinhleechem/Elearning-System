package org.example.elearning.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseLevel;
import org.hibernate.annotations.Nationalized;

import jakarta.persistence.Basic;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.FieldDefaults;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "courses")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEntity extends BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "course_id")
    Long courseId;


    @Column(name = "title", nullable = false)
    @Nationalized
    String title;

    @Column(name = "slug", nullable = false, unique = true)
    String slug;

    @Column(name = "short_description")
    @Nationalized
    String shortDescription;

    @Nationalized
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "description", columnDefinition = "TEXT")
    String description;

    @Nationalized
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "what_you_learn", columnDefinition = "TEXT")
    String whatYouLearn;

    @Nationalized
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "requirements", columnDefinition = "TEXT")
    String requirements;

    @Nationalized
    @Basic(fetch = FetchType.LAZY)
    @Column(name = "target_audience", columnDefinition = "TEXT")
    String targetAudience;

    @Column(name = "thumbnail_url")
    String thumbnailUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "level", length = 50)
    CourseLevel level; // BEGINNER, INTERMEDIATE, ADVANCED

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 20)
    @Builder.Default
    CourseStatus status = CourseStatus.DRAFT; // draft, published, archived

    @Column(name = "price", precision = 10, scale = 2)
    BigDecimal price;

    @Column(name = "current_price", precision = 10, scale = 2)
    BigDecimal currentPrice;

    @Column(name = "language", length = 50)
    String language;

    @Column(name = "has_certificate")
    Boolean hasCertificate;

    @Column(name = "average_rating", precision = 3, scale = 2)
    BigDecimal averageRating;

    @Column(name = "published_at")
    LocalDateTime publishedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    InstructorEntity instructor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    CategoryEntity category;
}
