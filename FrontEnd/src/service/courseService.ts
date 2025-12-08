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
  status: "DRAFT" | "PUBLISHED" | "ACHIEVED";
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
    if (params.categoryId) query.set("categoryId", params.categoryId.toString());
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
    const response = await httpClient<PublicCourseResponse>(`/courses/${slug}`, {
      method: "GET",
    });
    if (!response.data) {
      throw new Error(response.message || "Không tìm thấy khóa học");
    }
    return response.data;
  },
};


