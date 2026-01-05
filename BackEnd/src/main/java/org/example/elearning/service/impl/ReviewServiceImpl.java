package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.request.CreateReviewRequest;
import org.example.elearning.dto.request.UpdateReviewRequest;
import org.example.elearning.dto.response.ReviewResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.ReviewEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.ReviewRepository;
import org.example.elearning.service.ReviewService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.CourseService;
import org.example.elearning.service.EnrollmentService;
import org.example.elearning.mapper.ReviewMapper;
import org.example.elearning.specification.ReviewSpecification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.web.multipart.MultipartFile;
import java.io.IOException;
@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    ReviewRepository reviewRepository;
    
    UserService userService;
    CourseService courseService;
    EnrollmentService enrollmentService;
    ReviewMapper reviewMapper;

    // ... existing methods ...

    @Override
    @Transactional
    public void importReviews(MultipartFile file) throws IOException {
        try (Workbook workbook = new XSSFWorkbook(file.getInputStream())) {
            Sheet sheet = workbook.getSheetAt(0);
            for (Row row : sheet) {
                if (row.getRowNum() == 0) continue; // Skip header

                String userEmail = getCellValue(row, 0);
                if (userEmail == null || userEmail.isEmpty()) continue;

                String courseIdStr = getCellValue(row, 1);
                if (courseIdStr == null || courseIdStr.isEmpty()) continue;

                Long courseId;
                try {
                    courseId = (long) Double.parseDouble(courseIdStr);
                } catch (NumberFormatException e) {
                    continue;
                }

                String ratingStr = getCellValue(row, 2);
                Integer rating = 5;
                if (ratingStr != null && !ratingStr.isEmpty()) {
                    try {
                        rating = (int) Double.parseDouble(ratingStr);
                    } catch (NumberFormatException e) {
                        // Default to 5
                    }
                }

                String comment = getCellValue(row, 3);

                try {
                    UserEntity user = userService.getUserByEmail(userEmail);
                    CourseEntity course = courseService.getCourseEntityById(courseId);

                    if (user != null && course != null) {
                        // Check if review exists
                        if (reviewRepository.existsByUserAndCourse(user, course)) {
                            continue; // Skip if already reviewed
                        }

                        ReviewEntity review = ReviewEntity.builder()
                                .user(user)
                                .course(course)
                                .rating(rating)
                                .comment(comment)
                                .build();

                        reviewRepository.save(review);
                        
                        // Update course rating?? 
                        // updateCourseRating(course); call might be expensive in loop
                    }
                } catch (Exception e) {
                    // Skip invalid user/course
                }
            }
        }
    }

    private String getCellValue(Row row, int index) {
        Cell cell = row.getCell(index);
        if (cell == null) return null;
        switch (cell.getCellType()) {
            case STRING:
                return cell.getStringCellValue();
            case NUMERIC:
                if (DateUtil.isCellDateFormatted(cell)) {
                    return cell.getDateCellValue().toString();
                }
                return String.valueOf(cell.getNumericCellValue());
            case BOOLEAN:
                return String.valueOf(cell.getBooleanCellValue());
            default:
                return "";
        }
    }

    @Override
    @Transactional
    public ReviewResponse createReview(CreateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        CourseEntity course = courseService.getCourseEntityById(request.getCourseId());

        if (!enrollmentService.existsByUserAndCourse(user, course)) {
            throw new BusinessException("Bạn phải đăng ký khóa học trước khi đánh giá");
        }

        if (reviewRepository.existsByUserAndCourse(user, course)) {
            throw new BusinessException("Bạn đã đánh giá khóa học này rồi");
        }

        ReviewEntity review = ReviewEntity.builder()
                .course(course)
                .user(user)
                .rating(request.getRating())
                .comment(request.getComment())
                .build();

        review = reviewRepository.save(review);

        updateCourseRating(course);

        return mapToReviewResponse(review);
    }

    @Override
    @Transactional
    public ReviewResponse updateReview(Long reviewId, UpdateReviewRequest request) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.REVIEW_NOT_FOUND.getMessage()));

        if (!review.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.REVIEW_UNAUTHORIZED.getMessage());
        }

        if (request.getRating() != null) {
            review.setRating(request.getRating());
        }
        if (request.getComment() != null) {
            review.setComment(request.getComment());
        }

        review = reviewRepository.save(review);

        // Cập nhật rating của course
        updateCourseRating(review.getCourse());

        return mapToReviewResponse(review);
    }

    @Override
    @Transactional
    public void deleteReview(Long reviewId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        ReviewEntity review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.REVIEW_NOT_FOUND.getMessage()));

        if (!review.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.REVIEW_UNAUTHORIZED.getMessage());
        }

        CourseEntity course = review.getCourse();
        reviewRepository.delete(review);

        // Cập nhật rating của course
        updateCourseRating(course);
    }

    @Override
    public Page<ReviewResponse> getReviewsByCourse(Long courseId, Pageable pageable) {
        CourseEntity course = courseService.getCourseEntityById(courseId);

        Page<ReviewEntity> reviews = reviewRepository.findByCourse(course, pageable);

        return reviews.map(this::mapToReviewResponse);
    }

    @Override
    public ReviewResponse getMyReviewForCourse(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        CourseEntity course = courseService.getCourseEntityById(courseId);

        ReviewEntity review = reviewRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đánh giá khóa học này"));

        return mapToReviewResponse(review);
    }

    @Override
    public Page<ReviewResponse> getAllReviews(Pageable pageable, String search, Integer rating, Long courseId) {
        Page<ReviewEntity> reviews = reviewRepository.findAll(
                ReviewSpecification.filterReviews(search, rating, courseId),
                pageable
        );
        return reviews.map(this::mapToReviewResponse);
    }

    private void updateCourseRating(CourseEntity course) {
        Double avgRating = reviewRepository.getAverageRatingByCourse(course);
        if (avgRating == null) avgRating = 0.0;
        course.setAverageRating(BigDecimal.valueOf(avgRating));
    }

    private ReviewResponse mapToReviewResponse(ReviewEntity review) {
        return reviewMapper.toResponse(review);
    }
}

