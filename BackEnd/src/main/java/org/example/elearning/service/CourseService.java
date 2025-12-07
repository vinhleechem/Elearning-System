package org.example.elearning.service;

import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Pageable;

public interface CourseService {

    PaginatedResponse<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId, String level);

    PaginatedResponse<CourseResponse> getAllCoursesForAdmin(Pageable pageable, String search, CourseStatus status);

    CourseResponse getCourseBySlug(String slug);

    CourseResponse getCourseById(Long id);

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long id, CourseRequest request);

    void deleteCourse(Long id);
}


