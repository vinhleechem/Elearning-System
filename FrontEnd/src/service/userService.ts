import type { UserResponse } from "../types/auth";
import { httpClient } from "./httpClient";

// Các API user tự thao tác profile/avatar, khớp với backend hiện tại

export const userService = {
  // GET /api/v1/users/me
  getMyInfo: async (accessToken: string): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>("/users/me", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.data) {
      throw new Error("Không lấy được thông tin người dùng");
    }
    return response.data;
  },

  // PUT /api/v1/users/me (UpdateProfileRequest)
  updateProfile: async (
    accessToken: string,
    payload: {
      fullName?: string;
      phone?: string;
      address?: string;
      dateOfBirth?: string;
      bio?: string;
    },
  ): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>("/users/me", {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });
    if (!response.data) {
      throw new Error("Không cập nhật được profile");
    }
    return response.data;
  },

  // POST /api/v1/users/me/avatar (multipart/form-data, field "file")
  uploadAvatar: async (accessToken: string, file: File): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/users/me/avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // KHÔNG set Content-Type, để browser tự set multipart boundary
        },
        body: formData,
      },
    );

    const body = await res.json();

    if (!res.ok || body?.success === false) {
      throw new Error(body?.message ?? "Upload avatar thất bại");
    }

    if (!body?.data) {
      throw new Error("Không nhận được dữ liệu người dùng sau khi upload avatar");
    }

    return body.data as UserResponse;
  },

  // DELETE /api/v1/users/me/avatar
  deleteAvatar: async (accessToken: string): Promise<void> => {
    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/users/me/avatar`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    const body = await res.json().catch(() => null);

    if (!res.ok || body?.success === false) {
      throw new Error(body?.message ?? "Xóa avatar thất bại");
    }
  },
};


