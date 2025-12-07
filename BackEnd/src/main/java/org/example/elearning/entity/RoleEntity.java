package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import org.example.elearning.enums.Provider;
import org.hibernate.annotations.Nationalized;

import java.util.Set;

@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "roles")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class RoleEntity extends BaseEntity{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "role_id")
    Long roleId;

    @Column(name = "role_name", nullable = false, length = 50)
    @Nationalized
    String roleName;

    @ManyToMany(fetch =  FetchType.EAGER)
    @JoinTable(name ="role_permission", joinColumns = @JoinColumn(name="role_id"), inverseJoinColumns = @JoinColumn(name ="permission_id"))
    Set<PermissionEntity> permissions;

}
