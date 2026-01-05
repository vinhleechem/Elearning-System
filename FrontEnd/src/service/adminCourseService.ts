import { httpClient } from "./httpClient";

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export interface CourseResponse {
  courseId: number;
  instructorId: number;
  instructorName?: string;
  categoryId: number;
  categoryName?: string;
  title: string;
  slug: string;
  shortDescription?: string;
  description?: string;
  whatYouLearn?: string;
  requirements?: string;
  targetAudience?: string;
  thumbnailUrl?: string;
  previewVideoUrl?: string;
  level?: string;
  status: "DRAFT" | "PUBLISHED" | "ACHIEVED";
  price?: number;
  discountPrice?: number;
  language?: string;
  hasCertificate?: boolean;
  totalDurationMinutes?: number;
  totalLectures?: number;
  averageRating?: number;
  totalStudents?: number;
  totalReviews?: number;
  publishedAt?: string;
  isPurchased?: boolean;
  purchasedAt?: string;
  // Promotion info
  promotionName?: string;
  promotionType?: string;
  discountPercentage?: number;
  promotionEndDate?: string;
}

export const adminCourseService = {
  getCourses: async (
    accessToken: string,
    params: {
      page: number;
      size: number;
      search?: string;
      status?: "DRAFT" | "PUBLISHED" | "ACHIEVED";
    },
  ): Promise<PaginatedResponse<CourseResponse>> => {
    const query = new URLSearchParams();
    query.set("page", params.page.toString());
    query.set("size", params.size.toString());
    if (params.search && params.search.trim() !== "") {
      query.set("search", params.search.trim());
    }
    if (params.status) {
      query.set("status", params.status);
    }

    const response = await httpClient<PaginatedResponse<CourseResponse>>(
      `/courses/admin/list?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      throw new Error("Không lấy được danh sách khóa học");
    }

    return response.data;
  },

  getCourseById: async (
    accessToken: string,
    courseId: number,
  ): Promise<CourseResponse> => {
    const response = await httpClient<CourseResponse>(
      `/courses/admin/${courseId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      throw new Error("Không lấy được thông tin khóa học");
    }

    return response.data;
  },

  updateCourse: async (
    accessToken: string,
    courseId: number,
    data: {
      title: string;
      categoryId: number;
      shortDescription?: string;
      description?: string;
      whatYouLearn?: string;
      requirements?: string;
      targetAudience?: string;
      thumbnailUrl?: string;
      previewVideoUrl?: string;
      price?: number;
      discountPrice?: number;
      level?: string;
      language?: string;
      hasCertificate?: boolean;
    },
  ): Promise<CourseResponse> => {
    const response = await httpClient<CourseResponse>(`/courses/${courseId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.data) {
      throw new Error(response.message || "Cập nhật khóa học thất bại");
    }

    return response.data;
  },

  createCourse: async (
    accessToken: string,
    data: {
      title: string;
      categoryId: number;
      instructorId: number;
      shortDescription?: string;
      description?: string;
      whatYouLearn?: string;
      requirements?: string;
      targetAudience?: string;
      thumbnailUrl?: string;
      previewVideoUrl?: string;
      price?: number;
      discountPrice?: number;
      level?: string;
      language?: string;
      hasCertificate?: boolean;
    },
  ): Promise<CourseResponse> => {
    const response = await httpClient<CourseResponse>("/courses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.data) {
      throw new Error(response.message || "Tạo khóa học thất bại");
    }

    return response.data;
  },

  deleteCourse: async (
    accessToken: string,
    courseId: number,
  ): Promise<void> => {
    const response = await httpClient<void>(`/courses/${courseId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.success) {
      throw new Error(response.message || "Xóa khóa học thất bại");
    }
  },

  updateCourseStatus: async (
    accessToken: string,
    courseId: number,
    status:
      | "DRAFT"
      | "PUBLISHED"
      | "ACHIEVED"
      | "PENDING"
      | "REJECTED"
      | "ARCHIVED",
  ): Promise<CourseResponse> => {
    const response = await httpClient<CourseResponse>(
      `/courses/${courseId}/status`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (!response.data) {
      throw new Error(response.message || "Cập nhật trạng thái thất bại");
    }

    return response.data;
  },

  importCourses: async (accessToken: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient<void>("/courses/import", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });

    if (response.success === false) {
      throw new Error(response.message || "Import thất bại");
    }
  },
};
