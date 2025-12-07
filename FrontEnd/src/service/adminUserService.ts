import type { UserResponse } from "../types/auth";
import { httpClient, type StandardApiResponse } from "./httpClient";

type PageResponse<T> = {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};

export const adminUserService = {
  getUsers: async (
    accessToken: string,
    params: { page: number; size: number; search?: string },
  ): Promise<PageResponse<UserResponse>> => {
    const query = new URLSearchParams();
    query.set("page", params.page.toString());
    query.set("size", params.size.toString());
    if (params.search && params.search.trim() !== "") {
      query.set("search", params.search.trim());
    }

    const response = await httpClient<PageResponse<UserResponse>>(
      `/users?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      throw new Error("Không lấy được danh sách người dùng");
    }

    return response.data;
  },

  updateUserAvatar: async (
    accessToken: string,
    userId: number,
    file: File,
  ): Promise<UserResponse> => {
    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch(
      `${import.meta.env.VITE_BASE_URL}/users/${userId}/avatar`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          // Không set Content-Type để browser tự set multipart boundary
        },
        body: formData,
      },
    );

    const body = (await res.json()) as StandardApiResponse<UserResponse>;
    if (!res.ok || body?.success === false) {
      throw new Error(body?.message ?? "Cập nhật avatar người dùng thất bại");
    }
    if (!body.data) {
      throw new Error("Không nhận được dữ liệu người dùng sau khi cập nhật avatar");
    }
    return body.data;
  },
};


