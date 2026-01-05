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

  importCategories: async (accessToken: string, file: File): Promise<void> => {
    const formData = new FormData();
    formData.append("file", file);
    await httpClient<void>("/categories/import", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: formData,
    });
  },

  downloadTemplate: async (accessToken: string) => {
    const response = await fetch(`${import.meta.env.VITE_BASE_URL}/categories/import/template`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    });
    if (!response.ok) throw new Error("Failed to download template");
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "category_import_template.xlsx";
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  },
};

