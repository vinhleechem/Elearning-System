import { httpClient } from "./httpClient";

export interface InstructorResponse {
    instructorId: number;
    userId: number;
    fullName: string;
    email: string;
    avatarUrl?: string;
    headline?: string;
    biography?: string;
    website?: string;
    linkedin?: string;
    twitter?: string;
    youtube?: string;
    totalStudents?: number;
    totalCourses?: number;
}

export interface UpdateInstructorProfileRequest {
  headline?: string;
  biography?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  youtube?: string;
}

export const instructorService = {
    // GET /api/v1/instructors/{instructorId}
  getInstructorById: async (
    accessToken: string,
    instructorId: number,
  ): Promise<InstructorResponse> => {
    const response = await httpClient<InstructorResponse>(
      `/instructors/${instructorId}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      throw new Error("Không lấy được thông tin giảng viên");
    }

    return response.data;
  },

  // GET /api/v1/instructors/me
  getMyProfile: async (accessToken: string): Promise<InstructorResponse> => {
    const response = await httpClient<InstructorResponse>(`/instructors/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.data) {
      throw new Error("Không lấy được thông tin giảng viên");
    }

    return response.data;
  },

  // PUT /api/v1/instructors/me
  updateMyProfile: async (
    accessToken: string,
    payload: UpdateInstructorProfileRequest,
  ): Promise<InstructorResponse> => {
    const response = await httpClient<InstructorResponse>(`/instructors/me`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.data) {
      throw new Error("Không cập nhật được thông tin giảng viên");
    }

    return response.data;
  },
};
