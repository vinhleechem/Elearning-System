package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;

import java.time.LocalDateTime;

@Entity
@Table(name = "conversations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class ConversationEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "conversation_id")
    Long conversationId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    CourseEntity course;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    UserEntity student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "instructor_id", nullable = false)
    InstructorEntity instructor;

    @Column(name = "last_message_id")
    Long lastMessageId;

    @Column(name = "last_message_at")
    LocalDateTime lastMessageAt;

    @Column(name = "student_unread_count")
    @Builder.Default
    Integer studentUnreadCount = 0;

    @Column(name = "instructor_unread_count")
    @Builder.Default
    Integer instructorUnreadCount = 0;

    @Column(name = "is_archived")
    @Builder.Default
    Boolean isArchived = false;

    @Column(name = "is_locked")
    @Builder.Default
    Boolean isLocked = false;

}
