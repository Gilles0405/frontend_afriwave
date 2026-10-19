
export type CategoryStatus = "ACTIVE" | "INACTIVE";

export interface RadioCategory {
  id: number;
  radioId: number;
  name: string;
  slug: string;
  description: string | null;
  status: CategoryStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface CategoryPayload {
  name: string;
  description?: string | null;
  status?: CategoryStatus;
}

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  code?: string;
  data?: T;
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...options.headers,
    },
  });

  const result = (await response.json().catch(() => null)) as
    | ApiResponse<T>
    | null;

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.message || `Erreur HTTP ${response.status}`,
    );
  }

  return result;
}

const basePath = (radioId: number) =>
  `/api/radio-categories/${radioId}`;

export const radioCategoryService = {
  async getCategories(
    radioId: number,
    status?: CategoryStatus,
  ): Promise<RadioCategory[]> {
    const query = status
      ? `?status=${encodeURIComponent(status)}`
      : "";

    const result = await request<RadioCategory[]>(
      `${basePath(radioId)}${query}`,
    );

    return result.data ?? [];
  },

  async getCategory(
    radioId: number,
    categoryId: number,
  ): Promise<RadioCategory> {
    const result = await request<RadioCategory>(
      `${basePath(radioId)}/${categoryId}`,
    );

    if (!result.data) {
      throw new Error("Catégorie introuvable.");
    }

    return result.data;
  },

  async createCategory(
    radioId: number,
    payload: CategoryPayload,
  ): Promise<RadioCategory> {
    const result = await request<RadioCategory>(
      basePath(radioId),
      {
        method: "POST",
        body: JSON.stringify(payload),
      },
    );

    if (!result.data) {
      throw new Error("La catégorie créée n'a pas été retournée.");
    }

    return result.data;
  },

  async updateCategory(
    radioId: number,
    categoryId: number,
    payload: Partial<CategoryPayload>,
  ): Promise<RadioCategory> {
    const result = await request<RadioCategory>(
      `${basePath(radioId)}/${categoryId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );

    if (!result.data) {
      throw new Error("La catégorie mise à jour n'a pas été retournée.");
    }

    return result.data;
  },

  async deleteCategory(
    radioId: number,
    categoryId: number,
  ): Promise<void> {
    await request<unknown>(
      `${basePath(radioId)}/${categoryId}`,
      { method: "DELETE" },
    );
  },
};
