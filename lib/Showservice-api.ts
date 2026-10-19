
export type ShowStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export interface RadioShow {
  id: number;
  radioId: number;
  createdBy: number;
  title: string;
  slug: string;
  description: string | null;
  coverImage: string | null;
  hostName: string | null;
  daysOfWeek: number[];
  startTime: string | null;
  endTime: string | null;
  timezone: string;
  status: ShowStatus;
  createdAt: string;
  updatedAt: string;
}

export interface ShowPayload {
  title: string;
  description?: string | null;
  coverImage?: string | null;
  hostName?: string | null;
  daysOfWeek: number[];
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string;
}

export interface ShowUpdatePayload {
  title?: string;
  description?: string | null;
  coverImage?: string | null;
  hostName?: string | null;
  daysOfWeek?: number[];
  startTime?: string | null;
  endTime?: string | null;
  timezone?: string;
}

interface ShowsResponse {
  success: boolean;
  data: RadioShow[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

interface ShowResponse {
  success: boolean;
  message?: string;
  data: RadioShow;
}

interface UploadResponse {
  success: boolean;
  message?: string;
  data: {
    filename: string;
    originalName: string;
    mimeType: string;
    size: number;
    imageUrl: string;
  };
}

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(url, {
    ...options,
    headers: {
      ...(options.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options.headers,
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success === false) {
    throw new Error(
      result?.message || `Erreur HTTP ${response.status}`,
    );
  }

  return result as T;
}

export const radioShowService = {
  async getShows(
    radioId: number,
    params: {
      page?: number;
      limit?: number;
      status?: ShowStatus | "";
      search?: string;
    } = {},
  ) {
    const query = new URLSearchParams();

    query.set("page", String(params.page ?? 1));
    query.set("limit", String(params.limit ?? 10));

    if (params.status) query.set("status", params.status);
    if (params.search?.trim()) query.set("search", params.search.trim());

    return request<ShowsResponse>(
      `/api/radio-shows/${radioId}?${query.toString()}`,
    );
  },

  async getShow(radioId: number, showId: number) {
    return request<ShowResponse>(
      `/api/radio-shows/${radioId}/${showId}`,
    );
  },

  async createShow(radioId: number, payload: ShowPayload) {
    return request<ShowResponse>(`/api/radio-shows/${radioId}`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  async updateShow(
    radioId: number,
    showId: number,
    payload: ShowUpdatePayload,
  ) {
    return request<ShowResponse>(
      `/api/radio-shows/${radioId}/${showId}`,
      {
        method: "PATCH",
        body: JSON.stringify(payload),
      },
    );
  },

  async publishShow(radioId: number, showId: number) {
    return request<ShowResponse>(
      `/api/radio-shows/${radioId}/${showId}/publish`,
      { method: "POST" },
    );
  },

  async archiveShow(radioId: number, showId: number) {
    return request<ShowResponse>(
      `/api/radio-shows/${radioId}/${showId}/archive`,
      { method: "POST" },
    );
  },

  async deleteShow(radioId: number, showId: number) {
    return request<{ success: boolean; data: { id: number; deleted: boolean } }>(
      `/api/radio-shows/${radioId}/${showId}`,
      { method: "DELETE" },
    );
  },

  async uploadImage(radioId: number, file: File) {
    const formData = new FormData();
    formData.append("image", file);

    return request<UploadResponse>(
      `/api/radio-shows/${radioId}/upload-image`,
      {
        method: "POST",
        body: formData,
      },
    );
  },
};
