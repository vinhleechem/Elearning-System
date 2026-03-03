import { httpClient } from "./httpClient";

// Kiểu dữ liệu mirror với EnrollmentResponse bên BE
interface EnrollmentResponse {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  courseImage?: string;
  instructorName?: string;
  progress: number;
  enrolledAt: string;
  totalLessons?: number;
  completedLessons?: number;
  slug?: string;
  studentId?: number;
  studentName?: string;
  studentEmail?: string;
}

export interface AdminEnrollmentProgress {
  enrollmentId: number;
  courseId: number;
  courseTitle: string;
  studentId: number;
  studentName: string;
  studentEmail: string;
  progress: number;
  enrolledAt: string;
  totalLessons?: number;
  completedLessons?: number;
}

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

/**
 * Lưu ý: Các endpoint này CHƯA tồn tại trên backend.
 * Khi backend implement xong (ví dụ /api/v1/admin/enrollments...),
 * chỉ cần điều chỉnh lại path cho khớp.
 */
export const adminProgressService = {
  getEnrollments: async (
    page: number,
    size: number,
    options?: {
      search?: string;
      courseId?: number;
      minProgress?: number;
      maxProgress?: number;
    },
  ): Promise<PaginatedResponse<AdminEnrollmentProgress>> => {
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", size.toString());
    if (options?.search) params.set("search", options.search);
    if (options?.courseId) params.set("courseId", String(options.courseId));
    if (typeof options?.minProgress === "number") {
      params.set("minProgress", String(options.minProgress));
    }
    if (typeof options?.maxProgress === "number") {
      params.set("maxProgress", String(options.maxProgress));
    }

    const res = await httpClient<PaginatedResponse<EnrollmentResponse>>(
      `/admin/enrollments?${params.toString()}`,
      { method: "GET" },
    );
    if (!res.data) {
      throw new Error(res.message || "Không tải được danh sách enrollment");
    }

    const mapped: PaginatedResponse<AdminEnrollmentProgress> = {
      data: (res.data.data || []).map((e) => ({
        enrollmentId: e.enrollmentId,
        courseId: e.courseId,
        courseTitle: e.courseTitle,
        studentId: e.studentId || 0,
        studentName: e.studentName || "N/A",
        studentEmail: e.studentEmail || "",
        progress: e.progress ?? 0,
        enrolledAt: e.enrolledAt,
        totalLessons: e.totalLessons ?? 0,
        completedLessons: e.completedLessons ?? 0,
      })),
      pagination: res.data.pagination,
    };

    return mapped;
  },

  updateEnrollmentProgress: async (
    enrollmentId: number,
    progress: number,
  ): Promise<void> => {
    const params = new URLSearchParams();
    params.set("progress", progress.toString());

    await httpClient<void>(
      `/enrollments/${enrollmentId}/progress?${params.toString()}`,
      {
        method: "PUT",
      },
    );
  },
};

