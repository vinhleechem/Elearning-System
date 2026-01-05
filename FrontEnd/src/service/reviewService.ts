import { httpClient } from "./httpClient";

export interface ReviewResponse {
    reviewId: number;
    userId: number;
    userName: string;
    userAvatar?: string;
    courseId: number;
    courseTitle: string;
    rating: number;
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export interface UpdateReviewRequest {
    rating: number;
    comment?: string;
}

export interface PaginatedReviewResponse {
    data: ReviewResponse[];
    pagination: {
        pageNo: number;
        pageSize: number;
        totalElements: number;
        totalPages: number;
    };
}

export const reviewService = {
    // Get reviews by course
    getReviewsByCourse: async (
        courseId: number,
        page: number = 0,
        size: number = 10
    ): Promise<PaginatedReviewResponse> => {
        const response = await httpClient<PaginatedReviewResponse>(
            `/reviews/course/${courseId}?page=${page}&size=${size}`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không lấy được danh sách đánh giá");
        }
        return response.data;
    },

    // Get my review for a course
    getMyReviewForCourse: async (courseId: number): Promise<ReviewResponse> => {
        const response = await httpClient<ReviewResponse>(
            `/reviews/my-review/${courseId}`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không tìm thấy đánh giá");
        }
        return response.data;
    },

    // Update review
    updateReview: async (
        reviewId: number,
        data: UpdateReviewRequest
    ): Promise<ReviewResponse> => {
        const response = await httpClient<ReviewResponse>(
            `/reviews/${reviewId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không cập nhật được đánh giá");
        }
        return response.data;
    },

    // Delete review
    deleteReview: async (reviewId: number): Promise<void> => {
        const response = await httpClient<void>(
            `/reviews/${reviewId}`,
            { method: "DELETE" }
        );
        if (!response.success) {
            throw new Error(response.message || "Không xóa được đánh giá");
        }
    },
};
