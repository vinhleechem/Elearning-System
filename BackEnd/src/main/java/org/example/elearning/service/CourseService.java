package org.example.elearning.service;

import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface CourseService {

    PaginatedResponse<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId, String level);

    PaginatedResponse<CourseResponse> getAllCoursesForAdmin(Pageable pageable, String search, CourseStatus status);

    CourseResponse getCourseBySlug(String slug);

    CourseResponse getCourseById(Long id);

    CourseEntity getCourseEntityById(Long id);
    
    List<CourseEntity> getCourseEntitiesByIds(List<Long> ids);

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long id, CourseUpdateRequest request);

    void deleteCourse(Long id);

    PaginatedResponse<CourseResponse> getMyCourses(Pageable pageable, String search);

    void submitCourseForApproval(Long id);

    void approveCourse(Long id);

    void rejectCourse(Long id, String reason);

    CourseResponse updateCourseStatus(Long id, CourseStatus status);

    void importCourses(MultipartFile file) throws IOException;
}


