package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "lesson_questions")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class LessonAnswerEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "answer_id")
    Long answerId;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    String content;


}
