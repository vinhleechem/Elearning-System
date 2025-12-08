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
  getCategoryTree: async (): Promise<CategoryTreeResponse[]> => {
    const response = await httpClient<CategoryTreeResponse[]>(
      "/categories/tree",
      {
        method: "GET",
      }
    );
    return response.data || [];
  },
};

