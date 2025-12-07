package org.example.elearning.repository;

import org.example.elearning.entity.VideoAssetEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface VideoAssetRepository extends JpaRepository<VideoAssetEntity, Long> {
}


