import { httpClient } from "./httpClient";

export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export interface PublicCourseResponse {
  courseId: number;
  instructorId: number;
  instructorName?: string;
  categoryId: number;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  whatYouLearn?: string;
  requirements?: string;
  targetAudience?: string;
  previewVideoUrl?: string;
  language?: string;
  level?: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED" | "PENDING" | "REJECTED";
  price?: number;
  discountPrice?: number;
  thumbnailUrl?: string;
  averageRating?: number;
  totalStudents?: number;
  totalReviews?: number;
  publishedAt?: string;
  totalDurationMinutes?: number;
  totalLectures?: number;
  tags?: string[];
  isPurchased?: boolean;
  purchasedAt?: string;
  // Promotion info
  promotionName?: string;
  promotionType?:
    | "SEASONAL"
    | "FLASH_SALE"
    | "CLEARANCE"
    | "NEW_YEAR"
    | "BLACK_FRIDAY"
    | "SPECIAL_EVENT";
  discountPercentage?: number;
  promotionEndDate?: string;
}

export const courseService = {
  getPublicCourses: async (params: {
    page?: number;
    size?: number;
    search?: string;
    categoryId?: number;
    level?: string;
  }): Promise<PaginatedResponse<PublicCourseResponse>> => {
    const query = new URLSearchParams();
    query.set("page", (params.page ?? 0).toString());
    query.set("size", (params.size ?? 8).toString());
    if (params.search) query.set("search", params.search);
    if (params.categoryId)
      query.set("categoryId", params.categoryId.toString());
    if (params.level) query.set("level", params.level);

    const response = await httpClient<PaginatedResponse<PublicCourseResponse>>(
      `/courses?${query.toString()}`,
      { method: "GET" },
    );

    if (!response.data) {
      throw new Error(response.message || "Không lấy được danh sách khóa học");
    }

    return response.data;
  },

  getCourseBySlug: async (slug: string): Promise<PublicCourseResponse> => {
    const response = await httpClient<PublicCourseResponse>(
      `/courses/${slug}`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error(response.message || "Không tìm thấy khóa học");
    }
    return response.data;
  },

  getCourseById: async (id: number): Promise<PublicCourseResponse> => {
    const response = await httpClient<PublicCourseResponse>(
      `/courses/${id}/info`,
      {
        method: "GET",
      },
    );
    if (!response.data) {
      throw new Error(response.message || "Không tìm thấy khóa học");
    }
    return response.data;
  },

  createCourse: async (
    token: string,
    request: CreateCourseRequest,
  ): Promise<PublicCourseResponse> => {
    const response = await httpClient<PublicCourseResponse>("/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    });
    if (!response.data) {
      throw new Error(response.message || "Không thể tạo khóa học");
    }
    return response.data;
  },

  getMyCourses: async (params: {
    page?: number;
    size?: number;
    search?: string;
    token: string;
  }): Promise<PaginatedResponse<PublicCourseResponse>> => {
    const query = new URLSearchParams();
    query.set("page", (params.page ?? 0).toString());
    query.set("size", (params.size ?? 10).toString());
    if (params.search) query.set("search", params.search);

    const response = await httpClient<PaginatedResponse<PublicCourseResponse>>(
      `/courses/my-courses?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${params.token}`,
        },
      },
    );

    if (!response.data) {
      throw new Error(response.message || "Không lấy được danh sách khóa học");
    }

    return response.data;
  },

  submitForApproval: async (token: string, courseId: number): Promise<void> => {
    const response = await httpClient<string>(
      `/courses/${courseId}/submit-approval`,
      {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
      },
    );
    if (!response.success) throw new Error(response.message);
  },

  approveCourse: async (token: string, courseId: number): Promise<void> => {
    const response = await httpClient<string>(`/courses/${courseId}/approve`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.success) throw new Error(response.message);
  },

  rejectCourse: async (token: string, courseId: number): Promise<void> => {
    const response = await httpClient<string>(`/courses/${courseId}/reject`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.success) throw new Error(response.message);
  },
};

export interface CreateCourseRequest {
  instructorId: number;
  categoryId: number;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  whatYouLearn?: string;
  requirements?: string;
  targetAudience?: string;
  price?: number;
  discountPrice?: number;
  language?: string;
  level?: string;
  hasCertificate?: boolean;
}
