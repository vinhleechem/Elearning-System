package org.example.elearning.service;

import org.example.elearning.dto.request.AdminCourseRequest;
import org.example.elearning.dto.request.CourseUpdateRequest;
import org.example.elearning.dto.request.InstructorCourseRequest;
import org.example.elearning.dto.response.CourseResponse;
import org.example.elearning.dto.response.PaginatedResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.enums.CourseLevel;
import org.example.elearning.enums.CourseStatus;
import org.springframework.data.domain.Pageable;

import java.util.List;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;

public interface CourseService {

    CourseEntity getCourseEntityById(Long id);

    CourseResponse getCourseByIdForPublic(Long id);

    CourseResponse getCourseByIdForAdmin(Long id);

    PaginatedResponse<CourseResponse> getPublicCourses(
        Pageable pageable,
        String search,
        Long categoryId,
        CourseLevel level,
        Double minPrice,
        Double maxPrice,
        Double minRating);

    PaginatedResponse<CourseResponse> getAllCoursesForAdmin(Pageable pageable, String search, CourseStatus status);

    PaginatedResponse<CourseResponse> getMyCourses(Pageable pageable, String search);

    CourseResponse getCourseBySlug(String slug);

    List<CourseEntity> getCourseEntitiesByIds(List<Long> ids);

    // Related courses
    List<CourseResponse> getRelatedCourses(Long courseId);

    CourseResponse createCourseByInstructor(InstructorCourseRequest request);

    CourseResponse createCourseByAdmin(AdminCourseRequest request);

    CourseResponse updateCourse(Long id, CourseUpdateRequest request);

    CourseResponse reassignCourseInstructor(Long courseId, Long instructorId);

    void deleteCourse(Long id);

    void submitCourseForApproval(Long id);

    void approveCourse(Long id);

    void rejectCourse(Long id, String reason);

    CourseResponse updateCourseStatus(Long id, CourseStatus status);

    void importCourses(MultipartFile file) throws IOException;

    byte[] exportCourses() throws IOException;
}


