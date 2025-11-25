package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;
import lombok.experimental.SuperBuilder;
import lombok.extern.slf4j.Slf4j;
import org.example.elearning.enums.Provider;
import org.example.elearning.enums.UserStatus;
import org.hibernate.annotations.Nationalized;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import java.util.Set;

@Slf4j
@Entity
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@Table(name = "users")
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserEntity extends BaseEntity implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    Long userId;

    @Column(name = "email", unique = true, length = 50)
    String email;
    @Column(name = "password_hash", length = 255)
    String passwordHash;
    @Column(name = "full_name", nullable = false, length = 50)
    @Nationalized
    String fullName;

    @Column(name = "avatar_url")
    String avatarUrl;

    @Column(name = "providerId")
    String providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider")
    @Builder.Default
    Provider provider = Provider.LOCAL;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(name = "status")
    UserStatus status = UserStatus.ACTIVE;

    @ManyToMany(fetch =  FetchType.EAGER)
    @JoinTable(name="user_role",
            joinColumns = @JoinColumn(name="user_id"),
            inverseJoinColumns = @JoinColumn(name="role_id"))
    Set<RoleEntity> roles;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Collection<SimpleGrantedAuthority> authorities = new ArrayList<>();
        for (RoleEntity role : this.roles) {
            authorities.add(new SimpleGrantedAuthority(role.getRoleName()));
            if (role.getPermissions() != null) {
                for (PermissionEntity perm : role.getPermissions()) {
                    log.info(perm.toString());
                    authorities.add(new SimpleGrantedAuthority(perm.getPermissionName()));
                }
            }
        }
        log.info("Authorities: {}", authorities);
        return authorities;
    }

    @Override
    public String getPassword() {
        return passwordHash;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    @Override
    public boolean isEnabled() {
        return UserDetails.super.isEnabled();
    }
}
