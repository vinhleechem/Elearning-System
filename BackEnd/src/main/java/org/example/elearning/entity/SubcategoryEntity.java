package org.example.elearning.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.FieldDefaults;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Table(name = "subcategory")
@FieldDefaults(level = AccessLevel.PRIVATE)

public class SubcategoryEntity extends BaseEntity{
    @Id
    @Column(name = "subcategory_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    Long subcategoryId;

    @Column(name = "subcategory_name", nullable = false, length = 100)
    String subcategoryName;
}
