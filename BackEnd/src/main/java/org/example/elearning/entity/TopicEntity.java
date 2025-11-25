package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "topic")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class TopicEntity extends BaseEntity{
    @Id
    @Column(name = "topic_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long topicId;

    @Column(name = "topic_name", nullable = false, length = 100)
    String topicName;
}
