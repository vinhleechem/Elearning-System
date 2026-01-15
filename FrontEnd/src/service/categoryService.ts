import { httpClient } from "./httpClient";

export interface CategoryTreeResponse {
  id: number;
  name: string;
  slug: string;
  parentId: number | null;
  level: number;
  isActive: boolean;
  children: CategoryTreeResponse[];
}

export const categoryService = {
  // Get full category tree (all levels)
  getCategoryTree: async (): Promise<CategoryTreeResponse[]> => {
    const response = await httpClient<CategoryTreeResponse[]>(
      "/categories/tree",
      {
        method: "GET",
      }
    );
    return response.data || [];
  },

  // Get only root categories (level 1)
  getRootCategories: async (): Promise<CategoryTreeResponse[]> => {
    const response = await httpClient<CategoryTreeResponse[]>(
      "/categories",
      {
        method: "GET",
      }
    );
    return response.data || [];
  },

  // Get children of a specific category
  getChildren: async (parentId: number): Promise<CategoryTreeResponse[]> => {
    const response = await httpClient<CategoryTreeResponse[]>(
      `/categories/${parentId}/children`,
      {
        method: "GET",
      }
    );
    return response.data || [];
  },
};
