import { apiRequest } from "./article-api";


export interface RadioCategory {
  id: number;
  radioId: number;
  name: string;
  slug: string;
  description?: string | null;
  status: "ACTIVE" | "INACTIVE";
}

interface CategoryListResponse {
  success: boolean;
  data: RadioCategory[];
}

export const radioCategoryService = {
  getCategories(radioId: number) {
    return apiRequest<CategoryListResponse>(
      `/api/radio-categories/${radioId}?status=ACTIVE`,
    );
  },
};
