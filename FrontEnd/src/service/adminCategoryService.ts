import { httpClient } from "./httpClient";

export interface CategoryResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  level: number;
  isActive: boolean;
  children: CategoryResponse[];
}

export interface CategoryRequest {
  name: string;
  slug: string;
  parentId?: number | null;
}

export const adminCategoryService = {
  getCategoryTree: async (accessToken: string): Promise<CategoryResponse[]> => {
    const response = await httpClient<CategoryResponse[]>(
      "/categories/tree",
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data || [];
  },

  createCategory: async (
    accessToken: string,
    data: CategoryRequest
  ): Promise<CategoryResponse> => {
    const response = await httpClient<CategoryResponse>("/categories", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  updateCategory: async (
    accessToken: string,
    id: number,
    data: CategoryRequest
  ): Promise<CategoryResponse> => {
    const response = await httpClient<CategoryResponse>(`/categories/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(data),
    });
    return response.data!;
  },

  deleteCategory: async (accessToken: string, id: number): Promise<void> => {
    const response = await httpClient<void>(`/categories/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.success) {
      throw new Error(response.message || "Xóa thất bại");
    }
  },
};

