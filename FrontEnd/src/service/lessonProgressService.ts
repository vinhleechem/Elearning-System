import { httpClient } from "./httpClient";
import type { LessonProgress } from "../types/lessonProgress";

export const lessonProgressService = {
  getEnrollmentProgress: async (
    enrollmentId: number,
  ): Promise<LessonProgress[]> => {
    const res = await httpClient<LessonProgress[]>(
      `/enrollments/${enrollmentId}/progress`,
      { method: "GET" },
    );
    if (!res.data) {
      throw new Error(res.message || "Không lấy được tiến độ khóa học");
    }
    return res.data;
  },

  getLessonProgress: async (
    enrollmentId: number,
    lessonId: number,
  ): Promise<LessonProgress> => {
    const res = await httpClient<LessonProgress>(
      `/enrollments/${enrollmentId}/progress/lessons/${lessonId}`,
      { method: "GET" },
    );
    if (!res.data) {
      throw new Error(res.message || "Không lấy được tiến độ bài học");
    }
    return res.data;
  },

  markLessonCompleted: async (
    enrollmentId: number,
    lessonId: number,
    options?: { isToggle?: boolean },
  ): Promise<void> => {
    const qs = options?.isToggle ? "?isToggle=true" : "";
    await httpClient<void>(
      `/enrollments/${enrollmentId}/progress/lessons/${lessonId}/toggle-complete${qs}`,
      {
        method: "POST",
        body: JSON.stringify({}),
      },
    );
  },

  updateVideoPosition: async (
    enrollmentId: number,
    lessonId: number,
    positionSeconds: number,
  ): Promise<void> => {
    await httpClient<void>(
      `/enrollments/${enrollmentId}/progress/lessons/${lessonId}/position`,
      {
        method: "PUT",
        body: JSON.stringify({ positionSeconds }),
      },
    );
  },
};

