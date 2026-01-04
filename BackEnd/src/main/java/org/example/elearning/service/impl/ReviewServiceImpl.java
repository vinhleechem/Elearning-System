package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class ReviewServiceImpl implements ReviewService {
    ReviewRepository reviewRepository;
    
    UserService userService;
    CourseService courseService;
    EnrollmentService enrollmentService;
    ReviewMapper reviewMapper;

//    @Override
//    @Transactional
//    public ReviewResponse createReview(CreateReviewRequest request) {
//        String email = SecurityContextHolder.getContext().getAuthentication().getName();
//        UserEntity user = getUserByEmail(email);
//
//        CourseEntity course = courseRepository.findById(request.getCourseId())
//                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));
//
//        // Kiểm tra đã enroll chưa
//        if (!enrollmentRepository.existsByUserAndCourse(user, course)) {
//            throw new BusinessException("Bạn phải đăng ký khóa học trước khi đánh giá");
//        }
//
//        // Kiểm tra đã review chưa
//        if (reviewRepository.existsByUserAndCourse(user, course)) {
//            throw new BusinessException("Bạn đã đánh giá khóa học này rồi");
//        }
//
//        ReviewEntity review = ReviewEntity.builder()
//                .course(course)
//                .user(user)
//                .rating(request.getRating())
//                .comment(request.getComment())
//                .build();
//
//        review = reviewRepository.save(review);
//
//        // Cập nhật rating của course
//        updateCourseRating(course);
//
//        return mapToReviewResponse(review);
//    }

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

    private void updateCourseRating(CourseEntity course) {
        Double avgRating = reviewRepository.getAverageRatingByCourse(course);
        // TODO: Update course rating if needed
        // courseService can handle this
    }

    private ReviewResponse mapToReviewResponse(ReviewEntity review) {
        return reviewMapper.toResponse(review);
    }
}

