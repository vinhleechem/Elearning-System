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

export interface CreateReviewRequest {
    courseId: number;
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

    // Create review
    createReview: async (data: CreateReviewRequest): Promise<ReviewResponse> => {
        const response = await httpClient<ReviewResponse>(
            `/reviews`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không tạo được đánh giá");
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

    // Get all reviews (Admin only)
    getAllReviews: async (
        page: number = 0,
        size: number = 10,
        search?: string,
        rating?: number,
        courseId?: number
    ): Promise<PaginatedReviewResponse> => {
        const params = new URLSearchParams();
        params.set("page", page.toString());
        params.set("size", size.toString());
        if (search) params.set("search", search);
        if (rating) params.set("rating", rating.toString());
        if (courseId) params.set("courseId", courseId.toString());

        const response = await httpClient<PaginatedReviewResponse>(
            `/reviews/admin/all?${params.toString()}`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không lấy được danh sách đánh giá");
        }
        return response.data;
    },

    importReviews: async (file: File): Promise<void> => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await httpClient<void>(
            `/reviews/import`,
            {
                method: "POST",
                body: formData,
            }
        );
        if (!response.success) {
            throw new Error(response.message || "Lỗi khi import đánh giá");
        }
    },

    downloadTemplate: async (accessToken: string) => {
        const response = await fetch(`${import.meta.env.VITE_BASE_URL}/reviews/import/template`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            }
        });
        if (!response.ok) throw new Error("Failed to download template");
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "review_import_template.xlsx";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    },
};
