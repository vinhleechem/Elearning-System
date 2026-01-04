package org.example.elearning.service;

import org.example.elearning.dto.request.SectionRequest;
import org.example.elearning.dto.response.SectionResponse;
import org.example.elearning.entity.SectionEntity;

import java.util.List;

public interface SectionService {

    List<SectionResponse> getSectionsByCourse(Long courseId);

    SectionResponse createSection(Long courseId, SectionRequest request);

    SectionResponse updateSection(Long sectionId, SectionRequest request);

    void deleteSection(Long sectionId);
    
    // For internal service usage - returns entity instead of DTO
    SectionEntity getSectionEntityById(Long sectionId);
}


