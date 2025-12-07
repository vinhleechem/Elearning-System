package org.example.elearning.service;

import org.example.elearning.dto.request.CourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CourseService {

    Page<CourseResponse> getPublicCourses(Pageable pageable, String search, Long categoryId, String level);

    CourseResponse getCourseBySlug(String slug);

    CourseResponse getCourseById(Long id);

    CourseResponse createCourse(CourseRequest request);

    CourseResponse updateCourse(Long id, CourseRequest request);

    void deleteCourse(Long id);
}


