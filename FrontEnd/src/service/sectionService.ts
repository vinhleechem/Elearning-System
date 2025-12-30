import { httpClient } from "./httpClient";

export interface SectionRequest {
    title: string;
    position?: number;
}

export interface SectionResponse {
    sectionId: number;
    courseId: number;
    title: string;
    position: number;
    createdAt: string;
    updatedAt: string;
    lessonCount?: number;
}

export const sectionService = {
    // Get all sections for a course
    getSectionsByCourse: async (courseId: number): Promise<SectionResponse[]> => {
        const response = await httpClient<SectionResponse[]>(
            `/courses/${courseId}/sections`,
            { method: "GET" }
        );
        if (!response.data) {
            throw new Error(response.message || "Không lấy được danh sách section");
        }
        return response.data;
    },

    // Create new section
    createSection: async (
        courseId: number,
        data: SectionRequest
    ): Promise<SectionResponse> => {
        const response = await httpClient<SectionResponse>(
            `/courses/${courseId}/sections`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không tạo được section");
        }
        return response.data;
    },

    // Update section
    updateSection: async (
        courseId: number,
        sectionId: number,
        data: SectionRequest
    ): Promise<SectionResponse> => {
        const response = await httpClient<SectionResponse>(
            `/courses/${courseId}/sections/${sectionId}`,
            {
                method: "PUT",
                body: JSON.stringify(data),
            }
        );
        if (!response.data) {
            throw new Error(response.message || "Không cập nhật được section");
        }
        return response.data;
    },

    // Delete section
    deleteSection: async (
        courseId: number,
        sectionId: number
    ): Promise<void> => {
        const response = await httpClient<string>(
            `/courses/${courseId}/sections/${sectionId}`,
            { method: "DELETE" }
        );
        if (!response.success) {
            throw new Error(response.message || "Không xóa được section");
        }
    },
};
