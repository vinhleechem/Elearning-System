package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.hibernate.annotations.Nationalized;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "permissions")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class PermissionEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "permission_id")
    Long permissionId;

    @Column(name = "permission_name", nullable = false, length = 50)
    @Nationalized
    String permissionName;


}
