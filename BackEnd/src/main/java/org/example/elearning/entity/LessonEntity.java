package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.ContentType;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "lesson")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class LessonEntity extends BaseEntity{
    @Id
    @Column(name = "lesson_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long lessonId;

    @Column(name = "title", nullable = false, length = 100)
    String title;

    @Column(name = "position", nullable = false)
    Integer position;

    @Column(name = "content_url", nullable = false, length =  500)
    String contentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "content_type", nullable = false, length =  50)
    ContentType contentType;

    @Column(name="duration", nullable = false)
    Integer duration;

}
