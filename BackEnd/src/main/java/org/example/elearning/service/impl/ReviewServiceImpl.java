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
import org.example.elearning.repository.CourseRepository;
import org.example.elearning.repository.EnrollmentRepository;
import org.example.elearning.repository.ReviewRepository;
import org.example.elearning.repository.UserRepository;
import org.example.elearning.service.ReviewService;
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
    CourseRepository courseRepository;
    UserRepository userRepository;
    EnrollmentRepository enrollmentRepository;

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
        UserEntity user = getUserByEmail(email);

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
        UserEntity user = getUserByEmail(email);

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
        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

        Page<ReviewEntity> reviews = reviewRepository.findByCourse(course, pageable);

        return reviews.map(this::mapToReviewResponse);
    }

    @Override
    public ReviewResponse getMyReviewForCourse(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = getUserByEmail(email);

        CourseEntity course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy khóa học"));

        ReviewEntity review = reviewRepository.findByUserAndCourse(user, course)
                .orElseThrow(() -> new ResourceNotFoundException("Bạn chưa đánh giá khóa học này"));

        return mapToReviewResponse(review);
    }

    private void updateCourseRating(CourseEntity course) {
        Double avgRating = reviewRepository.getAverageRatingByCourse(course);
//        course.setRating(avgRating != null ? avgRating.floatValue() : 0f);
        courseRepository.save(course);
    }

    private UserEntity getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Không tìm thấy người dùng"));
    }

    private ReviewResponse mapToReviewResponse(ReviewEntity review) {
        UserEntity user = review.getUser();
        CourseEntity course = review.getCourse();

        return ReviewResponse.builder()
                .reviewId(review.getReviewId())
                .courseId(course.getCourseId())
                .courseTitle(course.getTitle())
                .userId(user.getUserId())
                .userName(user.getFullName())
                .userAvatar(user.getAvatarUrl())
                .rating(review.getRating())
                .comment(review.getComment())
                .createdAt(review.getCreatedAt())
                .build();
    }
}

