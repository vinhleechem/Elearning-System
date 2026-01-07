import type { UserResponse } from "../types/auth";
import { httpClient, type StandardApiResponse } from "./httpClient";

type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
  };
};

export const adminUserService = {
  getUsers: async (
    accessToken: string,
    params: { page: number; size: number; search?: string },
  ): Promise<PaginatedResponse<UserResponse>> => {
    const query = new URLSearchParams();
    query.set("page", params.page.toString());
    query.set("size", params.size.toString());
    if (params.search && params.search.trim() !== "") {
      query.set("search", params.search.trim());
    }

    const response = await httpClient<PaginatedResponse<UserResponse>>(
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

  createUser: async (
    accessToken: string,
    payload: {
      fullName: string;
      email: string;
      passwordHash: string;
    },
  ): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>("/users", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.data) {
      throw new Error("Không tạo được người dùng");
    }

    return response.data;
  },

  updateUser: async (
    accessToken: string,
    userId: number,
    payload: {
      fullName: string;
      email: string;
      avatarUrl?: string;
    },
  ): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>(`/users/${userId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.data) {
      throw new Error("Không cập nhật được người dùng");
    }

    return response.data;
  },

  deleteUser: async (accessToken: string, userId: number): Promise<void> => {
    const response = await httpClient<void>(`/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (response.success === false) {
      throw new Error(response.message || "Xóa người dùng thất bại");
    }
  },

  toggleUserStatus: async (
    accessToken: string,
    userId: number,
  ): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>(
      `/users/${userId}/toggle-status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.data) {
      throw new Error("Không thay đổi được trạng thái người dùng");
    }

    return response.data;
  },

  assignRoles: async (
    accessToken: string,
    userId: number,
    roleNames: string[],
  ): Promise<UserResponse> => {
    const response = await httpClient<UserResponse>(`/users/${userId}/roles`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(roleNames),
    });

    if (!response.data) {
      throw new Error("Không gán được roles cho người dùng");
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
      throw new Error(
        "Không nhận được dữ liệu người dùng sau khi cập nhật avatar",
      );
    }
    return body.data;
  },

  importUsers: async (accessToken: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await httpClient<void>("/users/import", {
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

  exportUsers: async (accessToken: string): Promise<Blob> => {
    const response = await fetch(
      `${import.meta.env.VITE_BASE_URL}/users/export`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new Error("Export users thất bại");
    }

    return await response.blob();
  },
};
