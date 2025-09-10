package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.CourseStatus;
import org.hibernate.annotations.Nationalized;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "section")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SectionEntity extends BaseEntity{
    @Id
    @Column(name = "section_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long sectionId;

    @Column(name = "title", nullable = false, length = 100)
    String title;

    @Column(name = "position", nullable = false)
    Integer position;

}
