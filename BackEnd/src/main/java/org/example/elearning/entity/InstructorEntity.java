package org.example.elearning.entity;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Entity
@Table(name = "instructors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class InstructorEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "instructor_id")
    Long instructorId;

    @OneToOne
    @JoinColumn(name = "user_id")
    UserEntity user;

    @Column(name = "headline")
    String headline;

    @Column(name = "biography")
    String biography;

    @Column(name = "website")
    String website;

    @Column(name = "linkedin")
    String linkedin;

    @Column(name = "twitter")
    String twitter;

    @Column(name = "youtube")
    String youtube;

    @Column(name = "total_students")
    Integer totalStudents;

    @Column(name = "total_courses")
    Integer totalCourses;

}
