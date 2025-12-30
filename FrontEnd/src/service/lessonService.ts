import { httpClient } from "./httpClient";

export interface LessonRequest {
    title: string;
    description?: string;
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";
    videoAssetId?: number;
    videoUrl?: string;
    articleContent?: string;
    durationSeconds?: number;
    isPreview?: boolean;
    isDownloadable?: boolean;
    sortOrder?: number;
    isActive?: boolean;
}

export interface LessonResponse {
    lessonId: number;
    sectionId: number;
    title: string;
    description?: string;
    type: "VIDEO" | "ARTICLE" | "QUIZ" | "ASSIGNMENT";
    videoAssetId?: number;
    videoUrl?: string;
    articleContent?: string;
    durationSeconds?: number;
    isPreview: boolean;
    isDownloadable: boolean;
    sortOrder: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export const lessonService = {
    // Get all lessons for a section
    getLessonsBySection: async (sectionId: number): Promise<LessonResponse[]> => {
        const response = await httpClient<LessonResponse[]>(
            `/sections/${sectionId}/lessons`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không lấy được danh sách bài học");
        }
        return response.data;
    },

    // Get lesson by ID
    getLessonById: async (
        sectionId: number,
        lessonId: number
    ): Promise<LessonResponse> => {
        const response = await httpClient<LessonResponse>(
            `/sections/${sectionId}/lessons/${lessonId}`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không tìm thấy bài học");
        }
        return response.data;
    },

    // Create new lesson
    createLesson: async (
        sectionId: number,
        data: LessonRequest
    ): Promise<LessonResponse> => {
        const response = await httpClient<LessonResponse>(
            `/sections/${sectionId}/lessons`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không tạo được bài học");
        }
        return response.data;
    },

    // Update lesson
    updateLesson: async (
        sectionId: number,
        lessonId: number,
        data: LessonRequest
    ): Promise<LessonResponse> => {
        const response = await httpClient<LessonResponse>(
            `/sections/${sectionId}/lessons/${lessonId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không cập nhật được bài học");
        }
        return response.data;
    },

    // Delete lesson
    deleteLesson: async (sectionId: number, lessonId: number): Promise<void> => {
        const response = await httpClient<string>(
            `/sections/${sectionId}/lessons/${lessonId}`,
            { method: "DELETE" }
        );
        if (!response.success) {
            throw new Error(response.message || "Không xóa được bài học");
        }
    },
};
