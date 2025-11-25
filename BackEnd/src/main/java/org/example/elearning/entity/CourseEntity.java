package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.CourseStatus;
import org.example.elearning.enums.CourseTag;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "course")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class CourseEntity extends BaseEntity{
    @Id
    @Column(name = "course_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long courseId;

    @Column(name = "title", nullable = false, length = 100)
    String title;

    @Column(name = "course_name_en", nullable = false, length = 150)
    String courseNameEn;

    @Column(name = "course_name_vi", nullable = false, length = 150)
    @Nationalized
    String courseNameVi;

    @Column(name = "slug_en", unique = true, nullable = false, length = 150)
    String slugEn;

    @Column(name = "slug_vi", unique = true, nullable = false ,length = 150)
    String slugVi;

    @Lob
    @Nationalized
    @Column(name = "description")
    String description;

    @Column(name = "price", nullable = false, precision = 10, scale = 2)
    BigDecimal price;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    @Builder.Default
    CourseStatus courseStatus = CourseStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "tag", length = 20)
    private CourseTag tag;

    @Column(name = "thumbnail", length = 255)
    String thumbnail;
}
