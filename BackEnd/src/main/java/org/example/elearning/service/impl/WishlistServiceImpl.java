package org.example.elearning.service.impl;

import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.example.elearning.dto.response.WishlistResponse;
import org.example.elearning.entity.CourseEntity;
import org.example.elearning.entity.UserEntity;
import org.example.elearning.entity.WishlistEntity;
import org.example.elearning.exception.ErrorCode;
import org.example.elearning.exception.exceptions.BusinessException;
import org.example.elearning.exception.exceptions.ResourceNotFoundException;
import org.example.elearning.repository.WishlistRepository;
import org.example.elearning.service.WishlistService;
import org.example.elearning.service.UserService;
import org.example.elearning.service.CourseService;
import org.example.elearning.mapper.WishlistMapper;
import org.example.elearning.service.UserService;
import org.example.elearning.service.CourseService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
@RequiredArgsConstructor
public class WishlistServiceImpl implements WishlistService {
    // ✅ Only own repository
    WishlistRepository wishlistRepository;
    
    // ✅ Use services for other entities
    UserService userService;
    CourseService courseService;
    WishlistMapper wishlistMapper;

    @Override
    @Transactional(readOnly = true)
    public List<WishlistResponse> getMyWishlist() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        List<WishlistEntity> wishlists = wishlistRepository.findByUser(user);

        return wishlists.stream()
                .map(this::mapToWishlistResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public WishlistResponse addToWishlist(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        CourseEntity course = courseService.getCourseEntityById(courseId);

        // Kiểm tra đã có trong wishlist chưa
        if (wishlistRepository.existsByUserAndCourse(user, course)) {
            throw new BusinessException(ErrorCode.COURSE_ALREADY_IN_WISHLIST.getMessage());
        }

        WishlistEntity wishlist = WishlistEntity.builder()
                .user(user)
                .course(course)
                .build();

        wishlist = wishlistRepository.save(wishlist);

        return mapToWishlistResponse(wishlist);
    }

    @Override
    @Transactional
    public void removeFromWishlist(Long wishlistId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        WishlistEntity wishlist = wishlistRepository.findById(wishlistId)
                .orElseThrow(() -> new ResourceNotFoundException(ErrorCode.WISHLIST_ITEM_NOT_FOUND.getMessage()));

        if (!wishlist.getUser().getUserId().equals(user.getUserId())) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_OPERATION.getMessage());
        }

        wishlistRepository.delete(wishlist);
    }

    @Override
    public boolean isInWishlist(Long courseId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        UserEntity user = userService.getUserByEmail(email);

        CourseEntity course = courseService.getCourseEntityById(courseId);

        return wishlistRepository.existsByUserAndCourse(user, course);
    }


    private WishlistResponse mapToWishlistResponse(WishlistEntity wishlist) {
        return wishlistMapper.toResponse(wishlist);
    }
}
