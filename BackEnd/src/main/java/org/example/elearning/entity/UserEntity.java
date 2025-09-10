package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.Provider;
import org.hibernate.annotations.Nationalized;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "user")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class UserEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long id;

    @Column(name = "email", unique = true, length = 50)
    String email;

    @Column(name = "full_name", nullable = false, length = 50)
    @Nationalized
    String fullName;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "providerId")
    String providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    Provider provider = Provider.LOCAL;

    @Column(name = "is_active")
    Boolean isActive;


}
