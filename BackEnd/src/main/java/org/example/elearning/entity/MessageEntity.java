package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import org.example.elearning.enums.SenderType;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "messages"

)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class MessageEntity extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "message_id")
    Long messageId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    UserEntity sender;

    @ManyToOne
    @JoinColumn(name = "conversation_id", nullable = false)
    ConversationEntity conversation;

    @Enumerated(EnumType.STRING)
    @Column(name = "sender_type", nullable = false, length = 20)
    SenderType senderType;

    @Column(name = "content", columnDefinition = "TEXT")
    String content;

    @Column(name = "image_url", length = 500)
    String imageUrl;

    @Column(name = "is_read")
    @Builder.Default
    Boolean isRead = false;

    @Column(name = "read_at")
    LocalDateTime readAt;

}
