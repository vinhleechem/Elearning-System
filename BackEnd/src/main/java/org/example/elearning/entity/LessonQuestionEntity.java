package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.ContentType;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "lesson_questions")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class LessonQuestionEntity extends BaseEntity{
    @Id
    @Column(name = "question_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long questionId;


    @Column(name = "content", nullable = false)
    String content;


}
